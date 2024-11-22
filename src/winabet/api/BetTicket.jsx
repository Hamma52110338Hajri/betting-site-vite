import { useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  Divider,
  Box,
  IconButton,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const BetTicket = ({ selectedBets, onRemoveBet, onRemoveAllBets, userBalance, onSubmitBet }) => {
  const [betAmount, setBetAmount] = useState('');

  const totalOdds = selectedBets.reduce((total, bet) => total * bet.odds, 1);

  const potentialWinnings = betAmount
    ? (parseFloat(betAmount) * totalOdds).toFixed(2)
    : '0.00';

  const handleBetAmountChange = (event) => {
    const value = event.target.value;
    if (
      value === '' ||
      (/^\d*\.?\d*$/.test(value) && parseFloat(value) <= userBalance)
    ) {
      setBetAmount(value);
    }
  };

  const handlePlaceBet = () => {
    if (betAmount && parseFloat(betAmount) > 0) {
      onSubmitBet(parseFloat(betAmount));
      setBetAmount('');
    }
  };

  return (
    <div
      style={{
        height: '50vh',
        overflowY: 'auto',
        backgroundColor: '#333',
        padding: '10px',
      }}
    >
      <Paper
        style={{
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
          backgroundColor: '#008672',
          color: '#fff',
        }}
      >
        <Box mb={2}>
          <Typography variant="h6" gutterBottom style={{ color: '#ff4' }}>
            Bet Ticket
          </Typography>
          <Typography
            variant="subtitle2"
            style={{ color: '#ff6541' }}
          >
            Balance: دينار{userBalance.toFixed(2)}
          </Typography>
        </Box>

        <Box mb={2}>
          {selectedBets.length > 0 ? (
            selectedBets.map((bet) => (
              <Paper
                key={bet.matchId}
                elevation={1}
                style={{
                  padding: '10px',
                  marginBottom: '10px',
                  borderRadius: '10px',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                  backgroundColor: '#333052',
                  color: '#fff',
                }}
              >
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Typography variant="h5" style={{ color: '#268545' }}>
                      {bet.matchName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          style={{ color: '#ff4' }}
                        >
                          {bet.type}
                        </Typography>
                        <Typography
                          variant="body2"
                          style={{ color: '#ff0' }}
                        >
                          {bet.selection} ({bet.params})
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight="bold"
                          style={{ color: '#fff' }}
                        >
                          cote: {bet.odds.toFixed(2)}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => {
                          console.log(`Removing bet with matchId: ${bet.matchId}`);
                          onRemoveBet(bet.matchId); // <-- This triggers the removal
                        }}
                        style={{ color: 'red' }}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ))
          ) : (
            <Typography
              variant="body2"
              align="center"
              style={{ color: '#ff5' }}
            >
              No selections yet
            </Typography>
          )}
        </Box>

        {selectedBets.length > 0 && (
          <>
            <Divider sx={{ my: 2, backgroundColor: '#ff5' }} />

            <Box mb={2}>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="body2" style={{ color: '#ff5' }}>
                    Total Odds: <strong>{totalOdds.toFixed(2)}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Stake Amount"
                    variant="outlined"
                    type="number"
                    value={betAmount}
                    onChange={handleBetAmountChange}
                    InputProps={{
                      startAdornment: (
                        <Typography style={{ color: '#333' }}>دينار</Typography>
                      ),
                      inputProps: { min: 0, max: userBalance, step: 0.01 },
                      style: { color: '#ffffffff' },
                    }}
                    helperText={`Max stake: دينار${userBalance.toFixed(2)}`}
                    style={{ color: '#fff' }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box mb={2}>
              <Typography
                variant="body2"
                style={{ color: '#fff' }}
              >
                Potential Winnings
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                style={{ color: '#fff' }}
              >
                دينار{potentialWinnings}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              disabled={!betAmount || parseFloat(betAmount) <= 0}
              onClick={handlePlaceBet}
              style={{
                backgroundColor: '#4caf50',
                color: 'white',
                borderRadius: '10px',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
              }}
            >
              Place Bet
            </Button>

            <Button
              variant="contained"
              fullWidth
              onClick={onRemoveAllBets}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                borderRadius: '10px',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
                marginTop: '10px',
              }}
            >
              Delete All Bets
              <DeleteOutlineIcon />
            </Button>
          </>
        )}
      </Paper>
    </div>
  );
};

export default BetTicket;
