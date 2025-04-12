const reports = [
    { id: 1, title: "Lost ID", description: "Dropped my ID near the cafeteria." },
    { id: 2, title: "Found Phone", description: "Found a phone in the hallway." },
    { id: 3, title: "Lost Umbrella", description: "Left my umbrella in room 304." }
  ];
  
  function createReportCard(report) {
    const card = document.createElement("div");
    card.className = "report-card";
    card.id = `report-${report.id}`;
  
    card.innerHTML = `
      <h3>${report.title}</h3>
      <p>${report.description}</p>
      <button class="accept">Accept</button>
      <button class="reject">Reject</button>
    `;
  
    // Handle accept
    card.querySelector(".accept").onclick = () => {
      document.getElementById("feed").appendChild(card);
      card.querySelector(".accept").remove();
      card.querySelector(".reject").remove();
    };
  
    // Handle reject
    card.querySelector(".reject").onclick = () => {
      card.remove();
    };
  
    return card;
  }
  
  function displayInbox() {
    const inbox = document.getElementById("inbox");
    reports.forEach((report) => {
      inbox.appendChild(createReportCard(report));
    });
  }
  
  displayInbox();
  