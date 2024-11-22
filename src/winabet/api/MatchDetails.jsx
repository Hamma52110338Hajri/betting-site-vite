import React from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Grid,
  Typography,
  Button,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BetButton from './BetButton'; // Correct import path

const MatchDetails = ({ match, onBack, onAddBet }) => {
  if (!match) return null;

  const formattedText = (inputString) => {
    const parts = inputString.split(/\.|: /); // Split by '.' or ': '
    return (
      <div>
        <div>{parts[0]}</div>         {/* First part: soccer */}
        <div>{parts[1]}</div>         {/* Second part: anytime_goalscorer */}
        <div>{`${parts[2]}: ${parts[3]}`}</div> {/* Third part: goalscorer-period: ft */}
      </div>
    );
  };

  const renderMarketGroup = (submarket, title, uniqueMarketId, marketKey, submarketKey) => {
    // Replace "_" with spaces and "-" with <br/>
    const formattedTitle = title
      .substring(6) // Remove the first 6 characters
      .split('_')   // Replace underscores with spaces
      .join(' ')
      .split('-')   // Replace dashes with <br/>
      .join('<br/>');
      

    return (
      <Accordion
        key={uniqueMarketId}
        style={{
          backgroundColor: '#1e1e1e',
          color: '#fff',
          borderRadius: '10px',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon style={{ color: '#fff' }} />}>
          <Typography
            variant="h5"
            style={{ color: '#4caf11', fontSize: '24px' }}
            dangerouslySetInnerHTML={{ __html: formattedTitle }} // Render with <br/>
          />
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {submarket.selections.map((selection, index) => (
              <Grid item xs={6} key={`${uniqueMarketId}-${index}`}>
                <Box sx={{ marginBottom: 3 }}>
                  <Typography
                    variant="body2"
                    style={{ color: '#fff', fontSize: '26px' }}
                  >
                    {selection.params}
                  </Typography>
                </Box>
                <BetButton
  selection={selection}
  onAddBet={() => onAddBet(selection, marketKey, submarketKey)}
  title={
    <Typography
      style={{ fontSize: '18px', color: '#ff4' }} 
    >
      {selection.outcome}
    </Typography>
  }
/>

              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };
  
  return (
    <Box sx={{ padding: 2, backgroundColor: '#000', borderRadius: '10px', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)', height: '100vh', overflowY: 'auto' }}>
      <Paper elevation={3} sx={{ padding: 2, marginBottom: 2, backgroundColor: '#1e1e1e', color: '#fff', borderRadius: '10px', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)' }}>
        <Typography variant="h5" style={{ color: '#fff', fontSize: '16px' }}>{match.name}</Typography>
        <Typography variant="body2" style={{ color: '#fff', fontSize: '16px' }}>
          {new Date(match.cutoffTime).toLocaleString()}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={onBack}
          sx={{ marginTop: 2, backgroundColor: '#4caf50', color: 'white', borderRadius: '20px', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)' }}
        >
          Back
        </Button>
      </Paper>

      {/* Display formatted text */}
      {formattedText("soccer.anytime_goalscorer-period: ft")}

      {/* Market and Submarket Details in Accordions */}
      {Object.entries(match.markets).map(([marketKey, marketData], marketIndex) =>
        Object.entries(marketData.submarkets).map(([submarketKey, submarket], submarketIndex) => {
          const title = `${marketKey.replace('.', ' ')} - ${submarketKey.replace('=', ': ')}`;
          const uniqueMarketId = `market-${marketIndex}-${submarketIndex}`;
          return renderMarketGroup(submarket, title, uniqueMarketId, marketKey, submarketKey);
        })
      )}
    </Box>
  );
};

MatchDetails.propTypes = {
  match: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    cutoffTime: PropTypes.string.isRequired,
    markets: PropTypes.objectOf(
      PropTypes.shape({
        submarkets: PropTypes.objectOf(
          PropTypes.shape({
            selections: PropTypes.arrayOf(
              PropTypes.shape({
                maxStake: PropTypes.number.isRequired,
                minStake: PropTypes.number.isRequired,
                outcome: PropTypes.string.isRequired,
                params: PropTypes.string.isRequired,
                price: PropTypes.number.isRequired,
                probability: PropTypes.number.isRequired,
                side: PropTypes.string.isRequired,
                status: PropTypes.string.isRequired,
              })
            ).isRequired,
          })
        ).isRequired,
      })
    ).isRequired,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
  onAddBet: PropTypes.func.isRequired,
};

export default MatchDetails;