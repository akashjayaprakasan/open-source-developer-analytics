def analyze_repositories(repositories):
    total_stars = 0
    total_forks = 0
    total_open_issues = 0

    repo_data = []

    for repo in repositories:
        total_stars += repo.get("stargazers_count", 0)
        total_forks += repo.get("forks_count", 0)
        total_open_issues += repo.get("open_issues_count", 0)

        repo_data.append({
            "name": repo.get("name"),
            "description": repo.get("description"),
            "language": repo.get("language"),
            "stars": repo.get("stargazers_count", 0),
            "forks": repo.get("forks_count", 0),
            "open_issues": repo.get("open_issues_count", 0),
            "updated_at": repo.get("updated_at"),
            "repo_url": repo.get("html_url")
        })

    return {
        "total_repositories": len(repositories),
        "total_stars": total_stars,
        "total_forks": total_forks,
        "total_open_issues": total_open_issues,
        "repositories": repo_data
    }
def calculate_language_stats(repositories):
    language_count = {}

    for repo in repositories:
        language = repo.get("language")

        if language:
            language_count[language] = language_count.get(language, 0) + 1

    total = sum(language_count.values())

    language_percentage = []

    for language, count in language_count.items():
        percentage = round((count / total) * 100, 2)

        language_percentage.append({
            "language": language,
            "repository_count": count,
            "percentage": percentage
        })

    return sorted(
        language_percentage,
        key=lambda item: item["repository_count"],
        reverse=True
    )


def calculate_developer_score(profile, repository_analysis):
    score = 0

    # Repository contribution
    score += min(repository_analysis["total_repositories"] * 5, 30)

    # GitHub stars received
    score += min(repository_analysis["total_stars"] * 3, 25)

    # Forks received
    score += min(repository_analysis["total_forks"] * 3, 15)

    # Followers
    score += min(profile.get("followers", 0) * 2, 10)

    # Bonus for active repositories
    if repository_analysis["total_repositories"] >= 3:
        score += 10

    # Bonus for using more than one language
    unique_languages = set(
        repo.get("language")
        for repo in repository_analysis["repositories"]
        if repo.get("language")
    )

    if len(unique_languages) >= 2:
        score += 10

    return min(score, 100)

def recommend_projects(languages, repository_analysis):
    language_names = [item["language"] for item in languages]

    recommendations = []

    if "Python" in language_names:
        recommendations.append({
            "title": "AI Resume Screening System",
            "description": "Build an AI-powered resume screening platform using Python, FastAPI, Machine Learning, and MongoDB.",
            "skills": ["Python", "FastAPI", "Machine Learning", "MongoDB"]
        })

        recommendations.append({
            "title": "Smart Healthcare Chatbot",
            "description": "Enhance your healthcare chatbot with voice input, disease prediction, emergency alerts, and cloud deployment.",
            "skills": ["Python", "Speech Recognition", "Machine Learning", "Docker"]
        })

    if "Java" in language_names:
        recommendations.append({
            "title": "Smart Railway Reservation System",
            "description": "Create a Java Spring Boot railway reservation platform with login, booking, payments, and database integration.",
            "skills": ["Java", "Spring Boot", "MySQL", "REST API"]
        })

    if "JavaScript" in language_names:
        recommendations.append({
            "title": "Real-Time Task Management Dashboard",
            "description": "Build a React task dashboard with authentication, notifications, charts, and cloud deployment.",
            "skills": ["React", "JavaScript", "Node.js", "MongoDB"]
        })

    if repository_analysis["total_repositories"] < 5:
        recommendations.append({
            "title": "Build More Portfolio Projects",
            "description": "Create and publish at least 5 polished repositories with README files, screenshots, and clear setup instructions.",
            "skills": ["Git", "GitHub", "Documentation", "Deployment"]
        })

    if not recommendations:
        recommendations.append({
            "title": "Full-Stack Developer Portfolio",
            "description": "Build a responsive portfolio website that automatically displays GitHub repositories and skills.",
            "skills": ["HTML", "CSS", "JavaScript", "GitHub API"]
        })

    return recommendations

from datetime import datetime, timezone


def analyze_contribution_activity(events):
    push_events = 0
    repositories_touched = set()
    recent_activity = []

    for event in events:
        event_type = event.get("type")
        repo_name = event.get("repo", {}).get("name")
        created_at = event.get("created_at")

        if repo_name:
            repositories_touched.add(repo_name)

        if event_type == "PushEvent":
            push_events += 1

        if len(recent_activity) < 10:
            recent_activity.append({
                "type": event_type,
                "repository": repo_name,
                "created_at": created_at
            })

    return {
        "total_recent_events": len(events),
        "push_events": push_events,
        "repositories_touched": len(repositories_touched),
        "recent_activity": recent_activity
    }