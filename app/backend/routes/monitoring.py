from fastapi import APIRouter, Depends
from typing import Dict, Any
from ..middleware.monitoring import get_metrics_collector
from ..monitoring.metrics import SystemMetrics

router = APIRouter()

@router.get("/health")
async def get_health(
    metrics: SystemMetrics = Depends(get_metrics_collector)
) -> Dict[str, Any]:
    """获取系统健康状态"""
    return metrics.get_system_health()

@router.get("/metrics")
async def get_metrics(
    metrics: SystemMetrics = Depends(get_metrics_collector)
) -> Dict[str, Dict[str, float]]:
    """获取所有指标"""
    return metrics.get_all_metrics()

@router.get("/alerts")
async def get_alerts(
    metrics: SystemMetrics = Depends(get_metrics_collector)
) -> Dict[str, Any]:
    """获取所有警报"""
    return {
        "alerts": metrics.alerts,
        "last_update": metrics.last_update.isoformat()
    } 