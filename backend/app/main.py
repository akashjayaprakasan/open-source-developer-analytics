from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.github_service import (
    get_github_profile,
    get_user_repositories,
    get_user_events
)
from app.database import profiles_collection
from app.analytics import (
    analyze_repositories,
    calculate_language_stats,
    calculate_developer_score,
    recommend_projects,
    analyze_contribution_activity
)

app = FastAPI(
    title="Open Source Developer Analytics API",
    description="GitHub profile, repository and language analytics platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://open-source-developer-analytics.vercel.app",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "Open Source Developer Analytics API is running successfully"
    }


@app.get("/api/profile/{username}")
def profile(username: str):
    user = get_github_profile(username)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="GitHub user not found"
        )

    repositories = get_user_repositories(username)
    profiles_collection.update_one(
    {"username": username},
    {
        "$set": {
            "username": username,
            "profile": {
                "name": user.get("name"),
                "bio": user.get("bio"),
                "avatar_url": user.get("avatar_url"),
                "followers": user.get("followers"),
                "following": user.get("following"),
                "public_repos": user.get("public_repos"),
                "profile_url": user.get("html_url")
            },
            "repository_count": len(repositories)
        }
    },
    upsert=True
)

    return {
        "profile": {
            "name": user.get("name"),
            "username": user.get("login"),
            "bio": user.get("bio"),
            "avatar_url": user.get("avatar_url"),
            "followers": user.get("followers"),
            "following": user.get("following"),
            "public_repos": user.get("public_repos"),
            "profile_url": user.get("html_url")
        },
        "repository_count": len(repositories)
    }

@app.get("/api/repositories/{username}")
def repositories(username: str):
    repos = get_user_repositories(username)

    if not repos:
        raise HTTPException(
            status_code=404,
            detail="No repositories found or GitHub username is invalid"
        )

    return analyze_repositories(repos)

@app.get("/api/languages/{username}")
def languages(username: str):
    repos = get_user_repositories(username)

    if not repos:
        raise HTTPException(
            status_code=404,
            detail="No repositories found or GitHub username is invalid"
        )

    return {
        "username": username,
        "languages": calculate_language_stats(repos)
    }

@app.get("/api/score/{username}")
def developer_score(username: str):
    profile = get_github_profile(username)
    repos = get_user_repositories(username)

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="GitHub user not found"
        )

    repository_analysis = analyze_repositories(repos)

    score = calculate_developer_score(
        profile,
        repository_analysis
    )

    if score < 30:
        level = "Beginner"
    elif score < 60:
        level = "Intermediate"
    else:
        level = "Advanced"

    return {
        "username": username,
        "developer_score": score,
        "level": level,
        "message": "Developer score is calculated using repositories, stars, forks, followers, activity, and language diversity."
    }

@app.get("/api/recommendations/{username}")
def recommendations(username: str):
    repos = get_user_repositories(username)

    if not repos:
        raise HTTPException(
            status_code=404,
            detail="No repositories found or GitHub username is invalid"
        )

    repository_analysis = analyze_repositories(repos)
    languages = calculate_language_stats(repos)

    return {
        "username": username,
        "recommendations": recommend_projects(
            languages,
            repository_analysis
        )
    }

@app.get("/api/saved-profiles")
def get_saved_profiles():
    try:
        profiles = list(
            profiles_collection.find(
                {},
                {"_id": 0}
            )
        )

        return {
            "count": len(profiles),
            "profiles": profiles
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to load saved profiles: {str(error)}"
        )

@app.get("/api/activity/{username}")
def activity(username: str):
    user = get_github_profile(username)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="GitHub user not found"
        )

    events = get_user_events(username)

    return {
        "username": username,
        "activity": analyze_contribution_activity(events)
    }

@app.get("/api/streak/{username}")
def contribution_streak(username: str):
    events = get_user_events(username)

    push_events = [
        event for event in events
        if event.get("type") == "PushEvent"
    ]

    active_days = len({
        event.get("created_at", "")[:10]
        for event in push_events
        if event.get("created_at")
    })

    return {
        "username": username,
        "recent_push_events": len(push_events),
        "active_days": active_days,
        "streak_message": (
            f"Active on {active_days} recent day(s). "
            "Keep committing consistently to build your streak."
        )
    }