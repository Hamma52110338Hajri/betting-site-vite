import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Locale, MarketType, getMarket, getSportsName } from "@cloudbet/market-helper";
import {
  Button, Collapse, Container, Grid, IconButton, MenuItem, Paper, Select, Skeleton, Typography
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { motion } from 'framer-motion';
const API_KEY = import.meta.env.VITE_API_KEY;
const sports = ["soccer", "basketball", "american-football", "baseball", "golf", "tennis"];
const sportMarkets = {
  "soccer": [MarketType.soccer_match_odds],
  "basketball": [MarketType.basketball_moneyline],
  "american-football": [MarketType.american_football_quarter_1x2],
  "baseball": [MarketType.baseball_moneyline],
  "golf": [MarketType.golf_winner],
  "tennis": [MarketType.tennis_winner]
};

const fetchData = async (url) => {
  const response = await fetch(url, {
    headers: { "X-Api-Key": API_KEY, "cache-control": "max-age=600" }
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

const BetButton = ({ label, odds, onPlaceBet }) => (
  <Button
    variant="outlined"
    fullWidth
    onClick={onPlaceBet}
    sx={{
      height: '80px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1687',
      border: '1px solid #333',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
      fontFamily: '"Helvetica Neue", Arial, sans-serif',
      color: '#008540',
      cursor: 'pointer',
    }}
  >
    <Typography variant="caption" style={{ color: '#ff1'  }}>{label}</Typography>
    <Typography variant="body2" style={{ color: '#ff1' }}>{odds}</Typography>
  </Button>
);

BetButton.propTypes = {
  label: PropTypes.string.isRequired,
  odds: PropTypes.number.isRequired,
  onPlaceBet: PropTypes.func.isRequired
};

const Country = ({ category, sportKey, onPlaceBet, onSelectMatch }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Grid item xs={12}>
      <Typography variant="h6" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer', fontFamily: '"Helvetica Neue", Arial, sans-serif', color: '#5cc500' }} >
        {category.name} {expanded ? <ExpandLessIcon style={{ color: '#156755' }} /> : <ExpandMoreIcon style={{ color: '#ff4125' }} />}
      </Typography>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Grid container spacing={2}>
          {category.competitions.map((comp) => (
            <Competition key={comp.key} competition={comp} sportKey={sportKey} onPlaceBet={onPlaceBet} onSelectMatch={onSelectMatch} />
          ))}
        </Grid>
      </Collapse>
    </Grid>
  );
};

Country.propTypes = {
  category: PropTypes.shape({
    name: PropTypes.string.isRequired,
    competitions: PropTypes.array.isRequired
  }).isRequired,
  sportKey: PropTypes.string.isRequired,
  onPlaceBet: PropTypes.func.isRequired,
  onSelectMatch: PropTypes.func.isRequired
};

const Competition = ({ competition, sportKey, onPlaceBet, onSelectMatch }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadEvents = async () => {
    setExpanded(!expanded);
    if (events.length || loading) return;
    setLoading(true);
    try {
      const data = await fetchData(`https://sports-api.cloudbet.com/pub/v2/odds/competitions/${competition.key}`);
      setEvents(data.events || []);
      console.log(data.events);
      
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid item xs={12} style={{ cursor: 'pointer' }}  >
      <div style={{ display: 'flex', alignItems: 'center' }} onClick={loadEvents}>
        <Typography variant="subtitle1" style={{ flexGrow: 1, fontFamily: '"Helvetica Neue", Arial, sans-serif', color: '#ff4' }}>{competition.name}</Typography>
        <IconButton>
          {expanded ? <ExpandLessIcon style={{ color: '#ff4' }} /> : <ExpandMoreIcon style={{ color: '#fff' }} />}
        </IconButton>
      </div>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Grid container spacing={2}>
          {loading ? (
            <Grid item xs={12} style={{ cursor: 'pointer' }} ><Skeleton variant="rectangular" height={20} style={{ cursor: 'pointer' }} /></Grid>
          ) : events.length > 0 ? (
            events.map((event) => (
              <Event
                key={event.id}
                event={event}
                sportKey={sportKey}
                onPlaceBet={onPlaceBet}
                onSelectMatch={onSelectMatch}
                cutoffTime={event.cutoffTime}
              />
            ))
          ) : (
            <Grid item xs={12}><Typography variant="body2" style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', color: '#fff' }}>No events available</Typography></Grid>
          )}
        </Grid>
      </Collapse>
    </Grid>
  );
};

Competition.propTypes = {
  competition: PropTypes.shape({
    key: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  sportKey: PropTypes.string.isRequired,
  onPlaceBet: PropTypes.func.isRequired,
  onSelectMatch: PropTypes.func.isRequired
};

const Event = ({ event, sportKey, onPlaceBet, cutoffTime, onSelectMatch }) => {
  const isLive = event.status === "TRADING_LIVE";

  const eventMarkets = useMemo(() => {
    const [markets] = getMarket(event, sportMarkets[sportKey][0]);
    return markets || [];
  }, [event, sportKey]);

  if (!eventMarkets.length) return null;

  const getTeamNames = () => {
    const homeTeam = event.home?.name || "Home";
    const awayTeam = event.away?.name || "Away";
    return [homeTeam, awayTeam];
  };

  const [homeTeam, awayTeam] = getTeamNames();

  const getBetLabelsAndSelections = (index) => {
    switch (sportKey) {
      case 'soccer':
        return {
          label: index === 0 ? "1" : index === 1 ? "X" : "2",
          selection: index === 0 ? homeTeam : index === 1 ? "Draw" : awayTeam
        };
      case 'basketball':
      case 'tennis':
      case 'baseball':
        return {
          label: index === 0 ? "1" : "2",
          selection: index === 0 ? homeTeam : awayTeam
        };
      case 'golf':
        return {
          label: "Winner",
          selection: homeTeam
        };
      default:
        return {
          label: "Selection",
          selection: homeTeam
        };
    }
  };

  return (
    <Grid item xs={12}>
      <Paper
        component={motion.div}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
        style={{
          padding: '16px',
          marginBottom: '16px',
          position: 'relative',
          borderRadius: '10px',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
          backgroundColor: '#1e1e1e',
          color: '#fff',
        }}
      >
        {isLive && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: 'red',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '1em',
              zIndex: 1,
            }}
          >
            LIVE
          </div>
        )}
        <Grid container direction="column" spacing={4}>
          <Grid item>
            <Typography variant="body2" style={{ color: '#fff' }}>
              Date: {new Date(cutoffTime).toLocaleString()}
            </Typography>
            <Typography variant="subtitle2" style={{ marginBottom: '16px', color: '#fff' }}>
              {`${homeTeam} vs ${awayTeam}`}
            </Typography>
          </Grid>
          <Grid item>
            <Grid container spacing={1}>
              {eventMarkets.map((market) => (
                <Grid container spacing={1} key={market.name}>
                  {market.lines[0].map((outcome, index) => {
                    const { label, selection } = getBetLabelsAndSelections(index);

                    if (sportKey === 'golf' && index > 0) return null;

                    return (
                      <Grid item xs={sportKey === 'golf' ? 12 : 4} key={index}>
                        <BetButton
                          label={label}
                          odds={outcome.back.price}
                          onPlaceBet={() => onPlaceBet({
                            matchId: event.id,
                            type: label,
                            odds: outcome.back.price,
                            matchName: event.name,
                            selection: selection
                          })}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              onClick={() => onSelectMatch(event)}
              style={{
                backgroundColor: '#4caf50',
                color: 'white',
                padding: '5px',
                borderRadius: '10px',
                marginTop: '5px',
                cursor: 'pointer',
                fontFamily: '"Helvetica Neue", Arial, sans-serif',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
              }}
            >
              More Bets
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};

Event.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    cutoffTime: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    home: PropTypes.object,
    away: PropTypes.object
  }).isRequired,
  sportKey: PropTypes.string.isRequired,
  onPlaceBet: PropTypes.func.isRequired,
  cutoffTime: PropTypes.string.isRequired,
  onSelectMatch: PropTypes.func.isRequired
};

const SportsEvents = ({ onPlaceBet, onSelectMatch }) => {
  const [selectedSport, setSelectedSport] = useState(sports[0]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await fetchData(`https://sports-api.cloudbet.com/pub/v2/odds/sports/${selectedSport}`);
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [selectedSport]);

  return (
    <ThemeProvider theme={createTheme({ palette: { mode: 'dark' } })}>
      <Container maxWidth="md" sx={{ height: '100vh', overflowY: 'auto', backgroundColor: '#000', padding: '20px', borderRadius: '10px', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)' }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', color: '#ff0' }}>Choose a Sport :</Typography>
            <Select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              fullWidth
              style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', color: '#fff' }}
              MenuProps={{
                PaperProps: {
                  style: {
                    backgroundColor: '#1e1e1e',
                    color: '#fff',
                  },
                },
              }}
            >
              {sports.map((sport) => (
                <MenuItem key={sport} value={sport} style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', color: '#fff' }}>
                  {getSportsName(sport, Locale.en)}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          {loading ? (
            <Grid item xs={12}><Skeleton variant="rectangular" height={100} style={{ backgroundColor: '#1e1e1e' }} /></Grid>
          ) : (
            categories.map((category) => (
              <Country
                key={category.key}
                category={category}
                sportKey={selectedSport}
                onPlaceBet={onPlaceBet}
                onSelectMatch={onSelectMatch}
              />
            ))
          )}
        </Grid>
      </Container>
    </ThemeProvider>
  );
};

SportsEvents.propTypes = {
  onPlaceBet: PropTypes.func.isRequired,
  onSelectMatch: PropTypes.func.isRequired
  
};

export default SportsEvents;