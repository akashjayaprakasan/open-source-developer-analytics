import os
import requests
from dotenv import load_dotenv

load_dotenv()

GITHUB_API_URL = "https://api.github.com"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

HEADERS = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}

if GITHUB_TOKEN:
    HEADERS["Authorization"] = f"Bearer {GITHUB_TOKEN}"


def github_get(url, params=None):
    response = requests.get(
        url,
        headers=HEADERS,
        params=params,
        timeout=20
    )

    if response.status_code == 404:
        return None

    if response.status_code == 403:
        message = response.json().get("message", "GitHub API access denied")
        raise Exception(message)

    response.raise_for_status()
    return response.json()


def get_github_profile(username: str):
    try:
        return github_get(f"{GITHUB_API_URL}/users/{username}")
    except Exception as error:
        print("GitHub profile request failed:", error)
        return None


def get_user_repositories(username: str):
    try:
        result = github_get(
            f"{GITHUB_API_URL}/users/{username}/repos",
            params={
                "per_page": 100,
                "sort": "updated",
            },
        )
        return result or []
    except Exception as error:
        print("GitHub repositories request failed:", error)
        return []


def get_user_events(username: str):
    try:
        result = github_get(
            f"{GITHUB_API_URL}/users/{username}/events/public",
            params={"per_page": 100},
        )
        return result or []
    except Exception as error:
        print("GitHub events request failed:", error)
        return []