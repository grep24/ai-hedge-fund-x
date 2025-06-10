from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging
from collections import deque
import statistics

logger = logging.getLogger(__name__)

class MetricsCollector:
    def __init__(self, max_history: int = 1000):
        self.max_history = max_history
        self.metrics: Dict[str, deque] = {}
        self.last_update = datetime.now()
        self.alerts: List[Dict[str, Any]] = []

    def record_metric(self, name: str, value: float, timestamp: Optional[datetime] = None) -> None:
        """记录指标"""
        if name not in self.metrics:
            self.metrics[name] = deque(maxlen=self.max_history)
        
        self.metrics[name].append({
            "value": value,
            "timestamp": timestamp or datetime.now()
        })
        self.last_update = datetime.now()

    def get_metric_stats(self, name: str, window: timedelta = timedelta(hours=1)) -> Dict[str, float]:
        """获取指标统计信息"""
        if name not in self.metrics:
            return {}

        cutoff_time = datetime.now() - window
        recent_values = [
            m["value"] for m in self.metrics[name]
            if m["timestamp"] > cutoff_time
        ]

        if not recent_values:
            return {}

        return {
            "current": recent_values[-1],
            "min": min(recent_values),
            "max": max(recent_values),
            "mean": statistics.mean(recent_values),
            "median": statistics.median(recent_values),
            "std_dev": statistics.stdev(recent_values) if len(recent_values) > 1 else 0
        }

    def check_alerts(self, thresholds: Dict[str, Dict[str, float]]) -> List[Dict[str, Any]]:
        """检查警报"""
        new_alerts = []
        
        for metric_name, threshold in thresholds.items():
            stats = self.get_metric_stats(metric_name)
            if not stats:
                continue

            current_value = stats["current"]
            
            if "min" in threshold and current_value < threshold["min"]:
                new_alerts.append({
                    "metric": metric_name,
                    "type": "below_minimum",
                    "value": current_value,
                    "threshold": threshold["min"],
                    "timestamp": datetime.now()
                })
            
            if "max" in threshold and current_value > threshold["max"]:
                new_alerts.append({
                    "metric": metric_name,
                    "type": "above_maximum",
                    "value": current_value,
                    "threshold": threshold["max"],
                    "timestamp": datetime.now()
                })

        self.alerts.extend(new_alerts)
        return new_alerts

    def get_all_metrics(self) -> Dict[str, Dict[str, float]]:
        """获取所有指标的统计信息"""
        return {
            name: self.get_metric_stats(name)
            for name in self.metrics
        }

    def clear_old_alerts(self, max_age: timedelta = timedelta(days=1)) -> None:
        """清理旧警报"""
        cutoff_time = datetime.now() - max_age
        self.alerts = [
            alert for alert in self.alerts
            if alert["timestamp"] > cutoff_time
        ]

class SystemMetrics(MetricsCollector):
    """系统级指标收集器"""
    def __init__(self):
        super().__init__()
        self.start_time = datetime.now()

    def record_api_call(self, endpoint: str, duration: float, status_code: int) -> None:
        """记录API调用指标"""
        self.record_metric(f"api_latency_{endpoint}", duration)
        self.record_metric(f"api_status_{endpoint}_{status_code}", 1)

    def record_agent_performance(self, agent_id: str, metrics: Dict[str, float]) -> None:
        """记录代理性能指标"""
        for name, value in metrics.items():
            self.record_metric(f"agent_{agent_id}_{name}", value)

    def record_portfolio_metrics(self, metrics: Dict[str, float]) -> None:
        """记录投资组合指标"""
        for name, value in metrics.items():
            self.record_metric(f"portfolio_{name}", value)

    def get_system_health(self) -> Dict[str, Any]:
        """获取系统健康状态"""
        return {
            "uptime": (datetime.now() - self.start_time).total_seconds(),
            "last_update": self.last_update.isoformat(),
            "metrics": self.get_all_metrics(),
            "alerts": self.alerts
        } 