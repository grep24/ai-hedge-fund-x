#!/usr/bin/env python3
import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(
        "app.backend.main:app",
        host="0.0.0.0",
        port=port,
        log_level="info"
    ) 