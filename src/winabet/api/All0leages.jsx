// App.jsx
import React, { useState, useEffect } from "react";
import './All0leages.css'



// BetSlip Component
const BetSlip = ({ selectedBets, betAmount, setBetAmount, userBalance, setUserBalance, removeFromBetSlip }) => {
  const calculateTotalOdds = () => {
    return selectedBets.reduce((total, bet) => total * bet.odds, 1);
  };

  const calculatePotentialWinnings = () => {
    return betAmount * calculateTotalOdds();
  };

  const placeCombinationBet = () => {
    if (betAmount > userBalance) {
      alert("Insufficient balance.");
      return;
    }
    
    const totalOdds = calculateTotalOdds();
    const potentialWinnings = calculatePotentialWinnings();
    
    setUserBalance(prevBalance => prevBalance - betAmount);
    alert(`Combination bet placed!\nTotal Odds: ${totalOdds.toFixed(2)}\nPotential Winnings: $${potentialWinnings.toFixed(2)}`);
    setBetAmount("");
  };

  return (
    <div className="bet-slip">
      <h3>Bet Slip</h3>
      {selectedBets.map((bet, index) => (
        <div key={index} className="bet-slip-item">
          <div className="bet-info">
            <p>{bet.matchName}</p>
            <p>Selection: {bet.type}</p>
            <p>Odds: {bet.odds}</p>
          </div>
          <button onClick={() => removeFromBetSlip(bet.id)} className="remove-bet">
            ×
          </button>
        </div>
      ))}
      
      {selectedBets.length > 0 && (
        <div className="bet-slip-footer">
          <p>Total Odds: {calculateTotalOdds().toFixed(2)}</p>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            placeholder="Enter bet amount"
            min="0"
          />
          <p>Potential Winnings: ${calculatePotentialWinnings().toFixed(2)}</p>
          <button onClick={placeCombinationBet} className="place-bet-button">
            Place Combination Bet
          </button>
        </div>
      )}
    </div>
  );
};

// Main SoccerMatches Component
const SoccerMatches = () => {
  const [sports, setSports] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedSport, setSelectedSport] = useState(null);
  const [userBalance, setUserBalance] = useState(100.0);
  const [selectedBets, setSelectedBets] = useState([]);
  const [betAmount, setBetAmount] = useState("");
  const [oddsFormat, setOddsFormat] = useState("decimal");

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch(
          `https://api.the-odds-api.com/v4/sports?apiKey=${import.meta.env.VITE_ODDS_API_KEY}`
        );
        const data = await response.json();
        setSports(data || []);
      } catch (error) {
        console.error("Failed to fetch sports", error);
      }
    };
    fetchSports();
  }, []);

  const fetchMatches = async (sportKey) => {
    setSelectedSport(sportKey);
    try {
      const response = await fetch(
        `https://api.the-odds-api.com/v4/sports/${sportKey}/odds?apiKey=${import.meta.env.VITE_ODDS_API_KEY}&regions=us&markets=h2h&oddsFormat=${oddsFormat}`
      );
      const data = await response.json();
      setMatches(data || []);
    } catch (error) {
      console.error("Failed to fetch matches", error);
    }
  };

  const addToBetSlip = (match, outcome) => {
    const betExists = selectedBets.some(bet => 
      bet.matchId === match.id && bet.type === outcome.name
    );

    if (!betExists) {
      const newBet = {
        id: `${match.id}-${outcome.name}`,
        matchId: match.id,
        matchName: `${match.home_team} vs ${match.away_team}`,
        type: outcome.name === match.home_team ? '1' : 
              outcome.name === 'Draw' ? 'X' : '2',
        odds: outcome.price,
      };
      setSelectedBets([...selectedBets, newBet]);
    }
  };

  const removeFromBetSlip = (betId) => {
    setSelectedBets(selectedBets.filter(bet => bet.id !== betId));
  };

  return (
    <div className="betting-container">
      <div className="main-content">
        <div className="header-section">
          <div className="user-balance">Balance: ${userBalance.toFixed(2)}</div>
          <div className="odds-format-selector">
            <label>
              <input
                type="radio"
                value="decimal"
                checked={oddsFormat === "decimal"}
                onChange={() => setOddsFormat("decimal")}
              />
              Decimal
            </label>
            <label>
              <input
                type="radio"
                value="american"
                checked={oddsFormat === "american"}
                onChange={() => setOddsFormat("american")}
              />
              American
            </label>
          </div>
        </div>

        <div className="sports-list">
          {sports.map((sport) => (
            <button
              key={sport.key}
              onClick={() => fetchMatches(sport.key)}
              className={selectedSport === sport.key ? 'active' : ''}
            >
              {sport.title}
            </button>
          ))}
        </div>

        <div className="content-wrapper">
          <div className="matches-section">
            {selectedSport && (
              <div className="matches-list">
                <h3>Matches for {selectedSport}</h3>
                {matches.map((match) => (
                  <div key={match.id} className="match-card">
                    <div className="match-header">
                      <span className="match-status">{match.sport_title}</span>
                      <span className="match-time">
                        {new Date(match.commence_time).toLocaleString()}
                      </span>
                    </div>

                    <div className="match-teams-container">
                      <div className="match-teams">
                        <div className="team home">
                          <span className="team-name">{match.home_team}</span>
                        </div>
                        <div className="team-vs">VS</div>
                        <div className="team away">
                          <span className="team-name">{match.away_team}</span>
                        </div>
                      </div>

                      {match.bookmakers && match.bookmakers[0]?.markets[0]?.outcomes && (
                        <div className="betting-options">
                          <button
                            className={`bet-button ${
                              selectedBets.some(bet => 
                                bet.matchId === match.id && bet.type === '1'
                              ) ? "selected" : ""
                            }`}
                            onClick={() => addToBetSlip(match, {
                              name: match.home_team,
                              price: match.bookmakers[0].markets[0].outcomes.find(o => o.name === match.home_team)?.price
                            })}
                          >
                            <div className="bet-type">1</div>
                            <div className="bet-odds">
                              {match.bookmakers[0].markets[0].outcomes.find(o => o.name === match.home_team)?.price}
                            </div>
                          </button>

                          <button
                            className={`bet-button ${
                              selectedBets.some(bet => 
                                bet.matchId === match.id && bet.type === 'X'
                              ) ? "selected" : ""
                            }`}
                            onClick={() => addToBetSlip(match, {
                              name: 'Draw',
                              price: match.bookmakers[0].markets[0].outcomes.find(o => o.name === 'Draw')?.price
                            })}
                          >
                            <div className="bet-type">X</div>
                            <div className="bet-odds">
                              {match.bookmakers[0].markets[0].outcomes.find(o => o.name === 'Draw')?.price}
                            </div>
                          </button>

                          <button
                            className={`bet-button ${
                              selectedBets.some(bet => 
                                bet.matchId === match.id && bet.type === '2'
                              ) ? "selected" : ""
                            }`}
                            onClick={() => addToBetSlip(match, {
                              name: match.away_team,
                              price: match.bookmakers[0].markets[0].outcomes.find(o => o.name === match.away_team)?.price
                            })}
                          >
                            <div className="bet-type">2</div>
                            <div className="bet-odds">
                              {match.bookmakers[0].markets[0].outcomes.find(o => o.name === match.away_team)?.price}
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bet-slip-section">
            <BetSlip
              selectedBets={selectedBets}
              betAmount={betAmount}
              setBetAmount={setBetAmount}
              userBalance={userBalance}
              setUserBalance={setUserBalance}
              removeFromBetSlip={removeFromBetSlip}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoccerMatches;
