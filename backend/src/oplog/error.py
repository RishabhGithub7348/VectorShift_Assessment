def get_error_message(error):
    return str(error) if hasattr(error, "message") else str(error)