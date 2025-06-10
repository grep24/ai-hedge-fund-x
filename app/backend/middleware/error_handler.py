from fastapi import Request
from fastapi.responses import JSONResponse
from ..utils.errors import BaseError
import logging
import traceback
from typing import Union, Dict, Any

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def error_handler(request: Request, call_next):
    try:
        return await call_next(request)
    except BaseError as e:
        # 处理自定义错误
        return JSONResponse(
            status_code=e.status_code,
            content=e.detail
        )
    except Exception as e:
        # 处理未预期的错误
        error_id = generate_error_id()
        logger.error(f"Unexpected error {error_id}: {str(e)}")
        logger.error(traceback.format_exc())
        
        return JSONResponse(
            status_code=500,
            content={
                "error_code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred",
                "error_id": error_id,
                "details": {
                    "path": request.url.path,
                    "method": request.method
                }
            }
        )

def generate_error_id() -> str:
    """生成唯一的错误ID"""
    import uuid
    return str(uuid.uuid4())

def format_error_response(
    error_code: str,
    message: str,
    details: Union[Dict[str, Any], None] = None
) -> Dict[str, Any]:
    """格式化错误响应"""
    return {
        "error_code": error_code,
        "message": message,
        "details": details or {}
    } 