import { useEffect, useState } from "react";
import Portfolio from "./Portfolio";
import axios from "axios";
import "./App.css";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [username, setUsername] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPortfolio, setShowPortfolio] = useState(false);
  const languageChartData = data
  ? {
      labels: data.languages?.languages?.map((item) => item.language) || [],
      datasets: [
        {
          label: "Repository Language Usage",
         data:
  data.languages?.languages?.map(
    (item) => item.repository_count
  ) || [],
          backgroundColor: [
            "#38bdf8",
            "#8b5cf6",
            "#22c55e",
            "#f59e0b",
            "#ef4444",
            "#ec4899"
          ],
          borderWidth: 1
        }
      ]
    }
  : null;

  const fetchSavedProfiles = async () => {
  try {
    const response = await axios.get(
      "http://localhost:8000/api/saved-profiles"
    );

    setSavedProfiles(response.data.profiles || []);
  } catch (error) {
    console.error("Unable to load saved profiles:", error);
  }
};

useEffect(() => {
  fetchSavedProfiles();
}, []);

  const fetchDeveloperData = async (selectedUsername = username) => {
  const cleanUsername = selectedUsername.trim();

  if (!cleanUsername) {
    setError("Please enter a GitHub username.");
    return;
  }

  try {
    setLoading(true);
    setError("");

   const [
  profileResponse,
  repositoryResponse,
  languageResponse,
  scoreResponse,
  recommendationResponse,
  activityResponse,
  streakResponse,
] = await Promise.all([
  axios.get(`http://localhost:8000/api/profile/${cleanUsername}`),
  axios.get(`http://localhost:8000/api/repositories/${cleanUsername}`),
  axios.get(`http://localhost:8000/api/languages/${cleanUsername}`),
  axios.get(`http://localhost:8000/api/score/${cleanUsername}`),
  axios.get(`http://localhost:8000/api/recommendations/${cleanUsername}`),
  axios.get(`http://localhost:8000/api/activity/${cleanUsername}`),
  axios.get(`http://localhost:8000/api/streak/${cleanUsername}`),
]);

    setData({
  profile: profileResponse.data,
  repositories: repositoryResponse.data,
  languages: languageResponse.data,
  score: scoreResponse.data,
  recommendations: recommendationResponse.data,
  activity: activityResponse.data,
  streak: streakResponse.data,
});

    await fetchSavedProfiles();
  } catch (error) {
    console.error("API error:", error);

    setError(
      error.response?.data?.detail ||
        `Could not analyze "${cleanUsername}". Check that the backend is running.`
    );
  } finally {
    setLoading(false);
  }
};
if (showPortfolio && data) {
  return (
    <Portfolio
      data={data}
      onBack={() => setShowPortfolio(false)}
    />
  );
}


  return (
    <div className="app">
      <header className="hero">
        <p className="eyebrow">GITHUB INSIGHTS PLATFORM</p>
        <h1>Open Source Developer Analytics</h1>
        <p className="subtitle">
          Analyze GitHub repositories, skills, activity, and project growth.
        </p>

{data && (
  <button
    className="portfolio-button"
    onClick={() => setShowPortfolio(true)}
  >
    Generate Portfolio
  </button>
)}

        <div className="search-box">
  <input
    type="text"
    value={username}
    onChange={(event) => setUsername(event.target.value)}
    onKeyDown={(event) => {
      if (event.key === "Enter") {
        fetchDeveloperData();
      }
    }}
    placeholder="Enter GitHub username"
  />

  <button
    type="button"
    onClick={() => fetchDeveloperData()}
    disabled={loading}
  >
    {loading ? "Analyzing..." : "Analyze Profile"}
  </button>
</div>
{error && <p className="error-message">{error}</p>}
      </header>

      {data && (
        <main className="dashboard">
          <section className="panel saved-profiles-panel">
  <h2>Saved Developer Profiles</h2>

  {savedProfiles.length > 0 ? (
    <div className="saved-profiles-list">
      {savedProfiles.map((savedProfile) => (
        <button
          className="saved-profile-card"
          key={savedProfile.username}
          onClick={() => {
  setUsername(savedProfile.username);
  fetchDeveloperData(savedProfile.username);
}}
        >
          <img
            src={savedProfile.profile.avatar_url}
            alt={savedProfile.username}
          />

          <div>
            <h3>
              {savedProfile.profile.name || savedProfile.username}
            </h3>
            <p>@{savedProfile.username}</p>
            <small>
              {savedProfile.repository_count} repositories
            </small>
          </div>
        </button>
      ))}
    </div>
  ) : (
    <p>No saved profiles yet.</p>
  )}
</section>
          <section className="profile-card">
            <img
              src={data.profile.profile.avatar_url}
              alt={`${data.profile.profile.username} profile`}
            />

            <div>
              <h2>
                {data.profile.profile.name || data.profile.profile.username}
              </h2>
              <p className="username">@{data.profile.profile.username}</p>
              <p>{data.profile.profile.bio || "GitHub developer profile"}</p>

              <div className="profile-meta">
                <span>{data.profile.profile.followers} Followers</span>
                <span>{data.profile.profile.following} Following</span>
                <span>{data.profile.profile.public_repos} Public Repositories</span>
              </div>

              <a
                href={data.profile.profile.profile_url}
                target="_blank"
                rel="noreferrer"
              >
                View GitHub Profile →
              </a>
            </div>
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <p className="stat-label">Developer Score</p>
              <h3>{data.score.developer_score}/100</h3>
              <span>{data.score.level}</span>
            </article>

             <article className="stat-card">
    <p className="stat-label">Contribution Streak</p>
    <h3>{data.streak?.active_days || 0} Days</h3>
    <span>
      {data.streak?.streak_message ||
        "No recent contribution data available."}
    </span>
  </article>

            <article className="stat-card">
              <p className="stat-label">Repositories</p>
              <h3>{data.repositories.total_repositories}</h3>
              <span>Public projects</span>
            </article>

            <article className="stat-card">
              <p className="stat-label">Stars Received</p>
              <h3>{data.repositories.total_stars}</h3>
              <span>Community recognition</span>
            </article>

            <article className="stat-card">
              <p className="stat-label">Forks</p>
              <h3>{data.repositories.total_forks}</h3>
              <span>Project reuse</span>
            </article>
          </section>

          <section className="content-grid">
            <article className="panel">
              <h2>Language Usage</h2>
              
              {languageChartData && (
  <div className="chart-container">
    <Pie data={languageChartData} />
  </div>
)}

              {data.languages.languages.length > 0 ? (
                data.languages.languages.map((item) => (
                  <div className="language-row" key={item.language}>
                    <div className="language-name">
                      <span>{item.language}</span>
                      <strong>{item.percentage}%</strong>
                    </div>

                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>

                    <small>{item.repository_count} repositories</small>
                  </div>
                ))
              ) : (
                <p>No programming language data found.</p>
              )}
            </article>

            <article className="panel">
              <h2>Recommended Projects</h2>

              <div className="recommendation-list">
                {data.recommendations.recommendations.map((project) => (
                  <div className="recommendation-card" key={project.title}>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>

                    <div className="skill-tags">
                      {project.skills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

<section className="panel activity-panel">
  <h2>Recent GitHub Activity</h2>

  <div className="activity-stats">
    <div>
      <strong>{data.activity.activity.total_recent_events}</strong>
      <span>Recent Events</span>
    </div>

    <div>
      <strong>{data.activity.activity.push_events}</strong>
      <span>Push Events</span>
    </div>

    <div>
      <strong>{data.activity.activity.repositories_touched}</strong>
      <span>Repositories Touched</span>
    </div>
  </div>

  <div className="activity-list">
    {data.activity.activity.recent_activity.length > 0 ? (
      data.activity.activity.recent_activity.map((event, index) => (
        <div className="activity-item" key={`${event.repository}-${index}`}>
          <div>
            <h3>{event.type}</h3>
            <p>{event.repository || "Unknown repository"}</p>
          </div>

          <span>
            {new Date(event.created_at).toLocaleDateString()}
          </span>
        </div>
      ))
    ) : (
      <p>No recent public GitHub activity found.</p>
    )}
  </div>
</section>
          <section className="panel repository-panel">
            <h2>Repository Analysis</h2>

            <div className="repository-list">
              {data.repositories.repositories.map((repository) => (
                <a
                  className="repository-card"
                  key={repository.name}
                  href={repository.repo_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <h3>{repository.name}</h3>
                  <p>{repository.description || "No description added yet."}</p>

                  <div className="repository-meta">
                    <span>{repository.language || "No language detected"}</span>
                    <span>★ {repository.stars}</span>
                    <span>⑂ {repository.forks}</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}



export default App;