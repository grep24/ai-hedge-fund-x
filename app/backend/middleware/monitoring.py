from fastapi import Request
import time
import logging
from ..monitoring.metrics import SystemMetrics

logger = logging.getLogger(__name__)
metrics = SystemMetrics()

async def monitoring_middleware(request: Request, call_next):
    """监控中间件，用于收集API调用指标"""
    start_time = time.time()
    
    try:
        response = await call_next(request)
        
        # 记录API调用指标
        duration = time.time() - start_time
        metrics.record_api_call(
            endpoint=request.url.path,
            duration=duration,
            status_code=response.status_code
        )
        
        return response
        
    except Exception as e:
        # 记录错误指标
        duration = time.time() - start_time
        metrics.record_api_call(
            endpoint=request.url.path,
            duration=duration,
            status_code=500
        )
        logger.error(f"Error in request {request.url.path}: {str(e)}")
        raise

def get_metrics_collector() -> SystemMetrics:
    """获取指标收集器实例"""
    return metrics 