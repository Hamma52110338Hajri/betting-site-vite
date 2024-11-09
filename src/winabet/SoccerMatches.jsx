// src/pages/SoccerMatches.jsx
import { useState, useEffect } from 'react';
import './SoccerMatches.css';

const SoccerMatches = () => {
  const [matches, setMatches] = useState([]);
  const [selectedBet, setSelectedBet] = useState(null);
  const [betAmount, setBetAmount] = useState(0);
  const [userBalance, setUserBalance] = useState(1000); // Example initial balance

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(
          'https://api.the-odds-api.com/v4/sports/basketball_nba/scores/?daysFrom=1&apiKey=7bcf36fd0280efa8820018838bf1384d'
        );
        const data = await response.json();
        console.log(data); // Check the structure of data
        setMatches(data || []);
      } catch (error) {
        console.error("Failed to fetch matches", error);
      }
    };

    fetchMatches();
  }, []);

  const placeBet = (matchId, betType, odds) => {
    if (betAmount <= 0) {
      alert("Please enter a valid bet amount");
      return;
    }

    if (betAmount > userBalance) {
      alert("Insufficient balance");
      return;
    }

    const bet = {
      matchId,
      betType,
      odds,
      amount: betAmount,
      potentialWin: (betAmount * odds).toFixed(2),
    };

    setUserBalance((prevBalance) => prevBalance - betAmount);
    alert(`Bet placed successfully! Potential win: $${bet.potentialWin}`);
    setBetAmount(0);
    setSelectedBet(null);
  };

  return (
    <div className="soccer-matches-container">
      <div className="user-balance">Balance: ${userBalance.toFixed(2)}</div>

      <div className="matches-list">
        {matches.map((match) => (
          <div key={match.id} className="match-card">
            <div className="match-header">
              <span className="match-status">teams</span>
              <span className="match-time">
                {new Date(match.commence_time).toLocaleString()}
              </span>
            </div>

            <div className="match-teams">
              <div className="team home">
                <span className="team-name">{match.home_team}</span>
              </div>
              <div className="team away">
                <span className="team-name">{match.away_team}</span>
              </div>
            </div>

            {match.bookmakers?.[0]?.markets?.[0]?.outcomes && (
              <div className="betting-options">
                <div className="bet-buttons">
                  {match.bookmakers[0].markets[0].outcomes.map(
                    (outcome, outcomeIndex) => (
                      <button
                        key={outcomeIndex}
                        className={`bet-button ${
                          selectedBet?.matchId === match.id &&
                          selectedBet?.type === outcome.name
                            ? 'selected'
                            : ''
                        }`}
                        onClick={() =>
                          setSelectedBet({
                            matchId: match.id,
                            type: outcome.name,
                            odds: outcome.price,
                          })
                        }
                      >
                        {outcome.name} ({outcome.price})
                      </button>
                    )
                  )}
                </div>

                {selectedBet && selectedBet.matchId === match.id && (
                  <div className="bet-placement">
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      placeholder="Enter bet amount"
                      min="0"
                    />
                    <button
                      className="place-bet-button"
                      onClick={() =>
                        placeBet(match.id, selectedBet.type, selectedBet.odds)
                      }
                    >
                      Place Bet
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SoccerMatches;
