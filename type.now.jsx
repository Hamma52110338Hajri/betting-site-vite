import React, { useState, useEffect, useCallback } from "react";
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  Select, 
  MenuItem, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  CircularProgress
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Configuration and Constants
const API_KEY = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Img4LThRX1YwZnlUVHRPY2ZXUWFBNnV2bktjcnIyN1YzcURzQ2Z4bE44MGMiLCJ0eXAiOiJKV1QifQ.eyJhY2Nlc3NfdGllciI6ImFmZmlsaWF0ZSIsImV4cCI6MTk2MjgzMDI2MSwiaWF0IjoxNjQ3NDcwMjYxLCJqdGkiOiIwYmE0M2FhNC00ZmZjLTRjNjQtYjMyYS1lYWJiM2FmN2Y1NDMiLCJzdWIiOiIwNGM2OTVhNC0zYzgzLTQwOTQtOGU3ZS1mZjM1ZmEwZjc1NzMiLCJ0ZW5hbnQiOiJjbG91ZGJldCIsInV1aWQiOiIwNGM2OTVhNC0zYzgzLTQwOTQtOGU3ZS1mZjM1ZmEwZjc1NzMifQ.Oeaa9YWtkzvNdi6qMO2xuPXEB_ncrFPfsO1gaA-wJnEEV-ReRlPWBXfCHC4DmVzXNxPqYBYjVLS9GTgCEv3pVLNBsjlIFaJrZ-gFQFjGRwIt-9lnz3ojFaZeSFuyr3LmWl04EHuDQUNVr5-v9bLRfqa8-iArn9PqlvHuJS9TT-6xNaUT24V9LZtWNXV6hBNzCfSI7QdGpW2MEDJe4ZkFyl-M2CeENgQC3sR6-v3zP0UwDj9mxDdHXIMGUgV9IKDKzQt1rXhGS878nesOBKEqjQkERKpmMmE_v_gBeAF98jnQ5hE1XkBpcf9Bc5jM5W8xcVUgn37RQN8Pav6tE1Ddwg';
const BASE_URL = 'https://sports-api.cloudbet.com/pub/v2/odds';

const SPORTS = [
  { key: 'soccer', name: 'Soccer' },
  { key: 'basketball', name: 'Basketball' },
  { key: 'american-football', name: 'American Football' },
  { key: 'tennis', name: 'Tennis' },
  { key: 'baseball', name: 'Baseball' }
];

const SportsEvents = () => {
  const [selectedSport, setSelectedSport] = useState(SPORTS[0].key);
  const [sportCategories, setSportCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [competitions, setCompetitions] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [betSlip, setBetSlip] = useState([]);
  const [openBetDialog, setOpenBetDialog] = useState(false);
  const [selectedBet, setSelectedBet] = useState(null);

  // Fetch Categories and Competitions for Selected Sport
  const fetchSportData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Categories
      const categoriesResponse = await fetch(`${BASE_URL}/sports/${selectedSport}`, {
        headers: { 
          'X-Api-Key': API_KEY,
          'Cache-Control': 'max-age=3600'
        }
      });
      const categoriesData = await categoriesResponse.json();
      setSportCategories(categoriesData.categories || []);

      // Fetch Competitions for each Category
      const competitionsPromises = categoriesData.categories.map(async (category) => {
        try {
          const competitionsResponse = await fetch(`${BASE_URL}/competitions?sport=${selectedSport}&category=${category.key}`, {
            headers: { 
              'X-Api-Key': API_KEY,
              'Cache-Control': 'max-age=3600'
            }
          });
          const competitionsData = await competitionsResponse.json();
          return {
            category,
            competitions: competitionsData.competitions || []
          };
        } catch (error) {
          console.error(`Error fetching competitions for ${category.name}:`, error);
          return { category, competitions: [] };
        }
      });

      const competitionsData = await Promise.all(competitionsPromises);
      setCompetitions(competitionsData);
    } catch (error) {
      toast.error('Failed to load sport data');
    } finally {
      setLoading(false);
    }
  }, [selectedSport]);

  // Fetch Events for a Specific Competition
  const fetchCompetitionEvents = useCallback(async (competitionKey) => {
    setLoading(true);
    try {
      const now = Math.floor(Date.now() / 1000);
      const twentyFourHoursLater = now + (24 * 60 * 60);

      const response = await fetch(
        `${BASE_URL}/events?competition=${competitionKey}&from=${now}&to=${twentyFourHoursLater}`, 
        {
          headers: { 
            'X-Api-Key': API_KEY,
            'Cache-Control': 'max-age=600'
          }
        }
      );
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial and Sport Change Effect
  useEffect(() => {
    fetchSportData();
  }, [fetchSportData]);

  // Handle Category Selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    // Find competitions for the selected category
    const categoryCompetitions = competitions.find(
      item => item.category.key === category.key
    )?.competitions || [];
    
    // If there are competitions, fetch events for the first competition
    if (categoryCompetitions.length > 0) {
      fetchCompetitionEvents(categoryCompetitions[0].key);
    }
  };

  const handleAddToBetSlip = (event, selection) => {
    const newBet = {
      ...event,
      selection,
      timestamp: Date.now()
    };
    setBetSlip([...betSlip, newBet]);
    setSelectedBet(newBet);
    setOpenBetDialog(true);
  };

  const handlePlaceBet = () => {
    toast.success('Bet placed successfully!');
    setOpenBetDialog(false);
    setBetSlip([]);
  };

  const renderEventCard = (event) => (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6">{event.name}</Typography>
          <Typography variant="body2">
            {new Date(event.startTime).toLocaleString()}
          </Typography>
        </Grid>
        <Grid item xs={12} container spacing={1}>
          {event.markets && event.markets.map((market, marketIndex) => (
            <Grid item xs={4} key={marketIndex}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => handleAddToBetSlip(event, market)}
              >
                {market.name} - {market.price}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Container maxWidth="lg">
      <ToastContainer />
      
      {/* Sports Selection */}
      <Box sx={{ mb: 2 }}>
        <Select
          fullWidth
          value={selectedSport}
          onChange={(e) => setSelectedSport(e.target.value)}
        >
          {SPORTS.map((sport) => (
            <MenuItem key={sport.key} value={sport.key}>
              {sport.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Categories Tabs */}
      {sportCategories.length > 0 && (
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {sportCategories.map((category) => (
            <Tab 
              key={category.key} 
              label={category.name} 
              onClick={() => handleCategorySelect(category)}
            />
          ))}
        </Tabs>
      )}

      {/* Loading Indicator */}
      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Events Grid */}
      {!loading && events.length > 0 ? (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {events.map((event) => (
            <Grid item xs={12} md={6} key={event.id}>
              {renderEventCard(event)}
            </Grid>
          ))}
        </Grid>
      ) : (
        !loading && (
          <Typography variant="body1" align="center" sx={{ mt: 4 }}>
            No events available
          </Typography>
        )
      )}

      {/* Bet Placement Dialog */}
      <Dialog 
        open={openBetDialog} 
        onClose={() => setOpenBetDialog(false)}
      >
        <DialogTitle>Place Bet</DialogTitle>
        <DialogContent>
          {selectedBet && (
            <Box>
              <Typography>Event: {selectedBet.name}</Typography>
              <Typography>Selection: {selectedBet.selection.name}</Typography>
              <Typography>Odds: {selectedBet.selection.price}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBetDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handlePlaceBet}
          >
            Confirm Bet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bet Slip */}
      <Paper 
        elevation={3} 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          right: 0, 
          width: 300, 
          p: 2 
        }}
      >
        <Typography variant="h6">Bet Slip</Typography>
        {betSlip.map((bet, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography variant="body2">{bet.name}</Typography>
          </Box>
        ))}
      </Paper>
    </Container>
  );
};

export default SportsEvents;