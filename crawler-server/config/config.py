import json
from pathlib import Path
from typing import Optional

BASE_DIR = Path(__file__).resolve().parent

def get_secret(
        key: str,
        default_value: Optional[str] = None,
        json_path: str = str(BASE_DIR / 'secrets.json')
):
    with open(json_path) as json_file:
        secrets = json.load(json_file)
    try:
        return secrets[key]
    except KeyError:
        if default_value:
            return default_value
        raise EnvironmentError(f"The {key} environment variable is not set")

MONGO_DB_NAME = get_secret("mongodb_name")
MONGO_URL = get_secret("mongodb_url")
REQUEST_PER_MINUTE = get_secret("request_per_minute")