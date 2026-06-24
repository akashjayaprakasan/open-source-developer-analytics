import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Portfolio.css";

function Portfolio({ data, onBack }) {
  const profile = data.profile.profile;
  const repositories = data.repositories.repositories || [];
  const languages = data.languages.languages || [];
  const recommendations = data.recommendations.recommendations || [];

  const downloadPortfolioPDF = async () => {
    try {
      const portfolioElement = document.getElementById("portfolio-content");

      if (!portfolioElement) {
        alert("Portfolio content not found.");
        return;
      }

      const canvas = await html2canvas(portfolioElement, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#071426",
        logging: false,
      });

      const imageData = canvas.toDataURL("image/jpeg", 0.9);

      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const imageWidth = pageWidth - margin * 2;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      const printableHeight = pageHeight - margin * 2;

      let heightLeft = imageHeight;
      let position = margin;

      pdf.addImage(
        imageData,
        "JPEG",
        margin,
        position,
        imageWidth,
        imageHeight
      );

      heightLeft -= printableHeight;

      while (heightLeft > 0) {
        pdf.addPage();

        position = margin - (imageHeight - heightLeft);

        pdf.addImage(
          imageData,
          "JPEG",
          margin,
          position,
          imageWidth,
          imageHeight
        );

        heightLeft -= printableHeight;
      }

      pdf.save(`${profile.username}-developer-portfolio.pdf`);
    } catch (error) {
      console.error("PDF download error:", error);
      alert("Unable to generate PDF. Please try again.");
    }
  };

  return (
    <div className="portfolio-page">
      <div className="portfolio-actions">
        <button className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>

        <button className="download-button" onClick={downloadPortfolioPDF}>
          Download Portfolio PDF
        </button>
      </div>

      <div id="portfolio-content">
        <header className="portfolio-hero">
          <img src={profile.avatar_url} alt={profile.username} />

          <div>
            <p className="portfolio-tag">DEVELOPER PORTFOLIO</p>
            <h1>{profile.name || profile.username}</h1>
            <p className="portfolio-username">@{profile.username}</p>
            <p>{profile.bio || "Open source developer and software enthusiast."}</p>

            <a
              href={profile.profile_url}
              target="_blank"
              rel="noreferrer"
            >
              View GitHub Profile →
            </a>
          </div>
        </header>

        <section className="portfolio-section">
          <h2>Developer Snapshot</h2>

          <div className="portfolio-stats">
            <div>
              <strong>{data.score.developer_score}/100</strong>
              <span>Developer Score</span>
            </div>

            <div>
              <strong>{data.repositories.total_repositories}</strong>
              <span>Repositories</span>
            </div>

            <div>
              <strong>{profile.followers}</strong>
              <span>Followers</span>
            </div>

            <div>
              <strong>{data.activity.activity.repositories_touched}</strong>
              <span>Repositories Touched</span>
            </div>
          </div>
        </section>

        <section className="portfolio-section">
          <h2>Technical Skills</h2>

          <div className="skill-list">
            {languages.length > 0 ? (
              languages.map((item) => (
                <span key={item.language}>
                  {item.language} · {item.percentage}%
                </span>
              ))
            ) : (
              <p>No language information available.</p>
            )}
          </div>
        </section>

        <section className="portfolio-section">
          <h2>Featured Projects</h2>

          <div className="portfolio-projects">
            {repositories.slice(0, 6).map((repository) => (
              <a
                key={repository.name}
                href={repository.repo_url}
                target="_blank"
                rel="noreferrer"
                className="portfolio-project-card"
              >
                <h3>{repository.name}</h3>
                <p>{repository.description || "Open-source project."}</p>

                <div>
                  <span>{repository.language || "Technology not detected"}</span>
                  <span>★ {repository.stars}</span>
                  <span>⑂ {repository.forks}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="portfolio-section">
          <h2>Growth Recommendations</h2>

          <div className="portfolio-recommendations">
            {recommendations.map((project) => (
              <article key={project.title}>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Portfolio;