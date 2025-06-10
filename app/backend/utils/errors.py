from fastapi import HTTPException
from typing import Optional, Dict, Any

class BaseError(HTTPException):
    def __init__(
        self,
        status_code: int,
        message: str,
        error_code: str,
        details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail={
            "error_code": error_code,
            "message": message,
            "details": details or {}
        })

class ValidationError(BaseError):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=400,
            message=message,
            error_code="VALIDATION_ERROR",
            details=details
        )

class NotFoundError(BaseError):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=404,
            message=message,
            error_code="NOT_FOUND",
            details=details
        )

class ServiceError(BaseError):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=500,
            message=message,
            error_code="SERVICE_ERROR",
            details=details
        )

class TradingError(BaseError):
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=400,
            message=message,
            error_code="TRADING_ERROR",
            details=details
        ) 