import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Paper,
  Chip,
  Button,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  CancelOutlined as CancelOutlinedIcon,
} from '@mui/icons-material';
import axios from 'axios';

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'won':
      return 'success';
    case 'lost':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return <AccessTimeIcon />;
    case 'won':
      return <CheckCircleOutlineIcon />;
    case 'lost':
      return <CancelOutlinedIcon />;
    default:
      return null;
  }
};

const PendingBets = ({ pendingBets, setPendingBets, onCashOut, onSettleBet }) => {
  const checkEventResult = async (eventId) => {
    try {
      const { data } = await axios.get(`https://api.cloudbet.com/sports/events/${eventId}/results`);
      return data;
    } catch (error) {
      console.error(`Error fetching result for event ${eventId}:`, error);
      return null;
    }
  };
  

  const updateBetStatus = async (bet) => {
    const updatedSelections = await Promise.all(
      bet.bets.map(async (selection) => {
        const result = await checkEventResult(selection.eventId);
        return result ? { ...selection, status: result.status } : selection;
      })
    );
  
    const allWon = updatedSelections.every((sel) => sel.status === 'won');
    const anyLost = updatedSelections.some((sel) => sel.status === 'lost');
  
    const updatedBet = {
      ...bet,
      bets: updatedSelections,
      status: allWon ? 'won' : anyLost ? 'lost' : 'pending',
    };
  
    setPendingBets((prev) =>
      prev.map((b) => (b.id === updatedBet.id ? updatedBet : b))
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const pendingBetUpdates = pendingBets.filter((bet) => bet.status === 'pending');
      pendingBetUpdates.forEach(updateBetStatus);
    }, 60000); 

    return () => clearInterval(interval);
  }, [pendingBets]);

  const handlePrint = (betId) => {
    const betElement = document.getElementById(`bet-${betId}`);
    if (betElement) {
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head>
            <title>Bet Details</title>
            <style>
              @media print {
                .hide-print { display: none; }
              }
              body { font-family: Arial, sans-serif; margin: 20px; }
              .bet-card { margin-bottom: 20px; padding: 20px; border: 1px solid #dd4; }
            </style>
          </head>
          <body>${betElement.outerHTML}</body>
        </html>
      `);
      newWindow.document.close();
      newWindow.print();
      newWindow.close();
    }
  };

  return (
    <Paper
     style={{
        height: '30vh', // Full viewport height
        overflowY: 'auto', // Enable scrolling for the entire page
        backgroundColor: '#121212', // Optional: Page background
        padding: '10px', // Optional: Padding for the page
      }}
    >
      <Typography variant="h5" gutterBottom style={{ color: '#f7f7f7', fontWeight: 600 }}>
        Bet History
      </Typography>
      {pendingBets.length > 0 ? (
        pendingBets.map((bet) => (
          <Paper
            key={bet.id}
            style={{
              padding: '20px',
              marginBottom: '15px',
              borderRadius: '15px', 
              boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.15)', // Soft shadow for elements
              background: '#008672', // Darker background to create contrast
              color: '#fff',
            }}
            id={`bet-${bet.id}`}
          >
            <Typography variant="p" style={{ color: '#ff0' }}>
              Bet ID: #{bet.id} -{' '}
              {new Date(bet.timestamp).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
              <Chip
                label={bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
                color={getStatusColor(bet.status)}
                size="small"
                style={{ color: '#fff' }}
              />
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ color: '#fff' }}>Match Name</TableCell>
                    <TableCell style={{ color: '#fff' }}>Type & Selection</TableCell>
                    <TableCell style={{ color: '#fff' }}>Odds</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bet.bets.map((selection) => (
                    <TableRow key={selection.eventId}>
                      <TableCell style={{ color: '#F5F5F5', fontWeight: 500 }}>{selection.matchName}</TableCell>
                      <TableCell style={{ color: '#E0E0E0' }}>{`${selection.type} - ${selection.selection}`}</TableCell>
                      <TableCell style={{ color: '#BB86FC' }}>{selection.odds.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="body2" mt={3} style={{ color: '#ff0' }}>
              <h3>Potential Winnings: <strong>دينار{bet.potentialWinnings}</strong></h3>
            </Typography>

            {bet.status === 'pending' && (
              <Grid container spacing={2} className="hide-print">
                <Grid item>
                  <Button
                    variant="contained"
                    onClick={() => onCashOut(bet.id)}
                    style={{
                      background: 'linear-gradient(135deg, #ff4567, #6EFFB5)', // Gradient for buttons
                      color: 'white',
                      borderRadius: '12px',
                      boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.2)', // Soft shadow for buttons
                    }}
                  >
                    Cash Out
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => onSettleBet(bet.id)}
                    style={{
                      background: 'linear-gradient(135deg, #ff4, #183)', // Gradient for buttons
                      color: 'white',
                      borderRadius: '12px',
                      boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.2)', 
                    }}
                  >
                    Reload Bet
                  </Button>
                </Grid>
              </Grid>
            )}
            <Grid container justifyContent="flex-end" mt={2} className="hide-print">
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handlePrint(bet.id)}
                style={{
                  backgroundColor: '#1e1e1e',
                  color: 'white',
                  border: '1px solid #BB86FC', // Accent border for print button
                  borderRadius: '12px',
                  boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.2)', 
                }}
              >
                Print
              </Button>
            </Grid>
          </Paper>
        ))
      ) : (
        <Typography style={{ color: '#fff' }}>No bet history</Typography>
      )}
    </Paper>
  );
};

PendingBets.propTypes = {
  pendingBets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      status: PropTypes.oneOf(['pending', 'won', 'lost']).isRequired,
      bets: PropTypes.arrayOf(
        PropTypes.shape({
          eventId: PropTypes.string.isRequired,
          matchName: PropTypes.string.isRequired,
          selection: PropTypes.string.isRequired,
          type: PropTypes.string.isRequired,
          odds: PropTypes.number.isRequired,
          status: PropTypes.oneOf(['pending', 'won', 'lost']).isRequired,
        })
      ).isRequired,
      potentialWinnings: PropTypes.string.isRequired,
    })
  ).isRequired,
  setPendingBets: PropTypes.func.isRequired,
  onCashOut: PropTypes.func.isRequired,
  onSettleBet: PropTypes.func.isRequired,
};

export default PendingBets;