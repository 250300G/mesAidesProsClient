import { useState, useEffect } from "react";
import service from "../../services/index.services";

function CockpitDashboard() {
  const [myFunds, setMyFunds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. READ : Récupération des aides matchées stockées en base de données
  useEffect(() => {
    const loadCockpit = async () => {
      try {
        const response = await service.get("/userFunds/my-cockpit");
        setMyFunds(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur de chargement du cockpit:", err);
        setError("Impossible de charger vos aides financières.");
        setLoading(false);
      }
    };
    loadCockpit();
  }, []);

  // 2. RECHERCHE ET FILTRAGE DYNAMIQUE
  const filteredFunds = myFunds.filter((item) => {
    const title = item.fundId?.title || "";
    const category = item.fundId?.category || "";
    return (
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // 3. UPDATE : Changer le statut d'une aide (CRUD)
  const handleStatusChange = async (userFundId, newStatus) => {
    try {
      await service.put(`/userFunds/${userFundId}`, { status: newStatus });
      // Mise à jour immédiate de l'état React pour l'affichage
      setMyFunds(myFunds.map(f => f._id === userFundId ? { ...f, status: newStatus } : f));
    } catch (err) {
      console.error("Erreur de mise à jour:", err);
    }
  };

  // 4. DELETE : Supprimer une aide du tableau de bord (CRUD)
  const handleDelete = async (userFundId) => {
    try {
      await service.delete(`/userFunds/${userFundId}`);
      // Retire instantanément la ligne de l'écran
      setMyFunds(myFunds.filter(f => f._id !== userFundId));
    } catch (err) {
      console.error("Erreur de suppression:", err);
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>Chargement de votre Cockpit sécurisé...</p>;

  return (
    <div style={{ padding: "30px", maxWidth: "1000px", margin: "0 auto" }}>
      <h1 style={{ color: "#005088" }}>Mon Cockpit Dirigeant</h1>
      <p style={{ color: "#666" }}>Voici les subventions sélectionnées par similarité pour votre entreprise.</p>

      {/* BARRE DE RECHERCHE DYNAMIQUE */}
      <div style={{ margin: "20px 0" }}>
        <input
          type="text"
          placeholder="🔍 Filtrer mes aides dynamiquement par mot-clé ou catégorie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "15px" }}
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* TABLEAU DE GESTION DES DISPOSITIFS */}
      <table style={{ width: "100%", borderCollapse: "collapse", background: "white", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
        <thead>
          <tr style={{ background: "#f8f9fa", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>
            <th style={{ padding: "15px" }}>Aide proposée par vos pairs</th>
            <th style={{ padding: "15px" }}>Montant Maximum</th>
            <th style={{ padding: "15px" }}>Statut / Action</th>
            <th style={{ padding: "15px" }}>Gestion</th>
          </tr>
        </thead>
        <tbody>
          {filteredFunds.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                Aucune aide trouvée dans votre sélection.
              </td>
            </tr>
          ) : (
            filteredFunds.map((item) => (
              <tr key={item._id} style={{ borderBottom: "1px solid #dee2e6" }}>
                <td style={{ padding: "15px" }}>
                  <span style={{ fontSize: "12px", background: "#e2e8f0", padding: "3px 8px", borderRadius: "4px", fontWeight: "6px" }}>
                    {item.fundId?.category || "Général"}
                  </span>
                  <div style={{ marginTop: "5px", fontWeight: "bold", color: "#2d3748" }}>{item.fundId?.title}</div>
                </td>
                <td style={{ padding: "15px", fontWeight: "bold", color: "#11caa0" }}>
                  {item.fundId?.maxAmount ? `${item.fundId.maxAmount.toLocaleString()} €` : "Sur devis"}
                </td>
                <td style={{ padding: "15px" }}>
                  {/* SELECT UNIQUE POUR VALIDER L'UPDATE DU CRUD */}
                  <select
                    value={item.status || "À traiter"}
                    onChange={(e) => handleStatusChange(item._id, e.target.value)}
                    style={{ padding: "6px 10px", borderRadius: "4px", borderColor: "#cbd5e0" }}
                  >
                    <option value="À traiter">📁 À traiter (Gisement)</option>
                    <option value="Dossier déposé">⏳ Dossier déposé</option>
                    <option value="Subvention obtenue">💰 Subvention obtenue</option>
                  </select>
                </td>
                <td style={{ padding: "15px" }}>
                  {/* BOUTON POUR VALIDER LE DELETE DU CRUD */}
                  <button
                    onClick={() => handleDelete(item._id)}
                    style={{ background: "#e53e3e", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
                  >
                    Retirer
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CockpitDashboard;