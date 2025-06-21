import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("oplog")

def info(msg: str):
    logger.info(msg)

def error(msg: str):
    logger.error(msg)