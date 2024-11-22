import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import {
  AppBar,
  Box,
  Collapse,
  Container,
  Divider,
  Drawer,
  Fab,
  Grid,
  IconButton,
  List, ListItem, ListItemIcon, ListItemText,
  Paper,
  Popover,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SoccerMatches from './winabet/api/All0leages';
import BetTicket from './winabet/api/BetTicket';
import MatchDetails from './winabet/api/MatchDetails';
import PendingBets from './winabet/api/PendingBets';
import PromoSlider from './winabet/api/PromoSlider'; // Adjust the path if needed
import './winabet/api/styles/App.css';

const Home = () => {
  const [selectedBets, setSelectedBets] = useState([]);
  const [pendingBets, setPendingBets] = useState([]);
  const [userBalance, setUserBalance] = useState(50);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sportListOpen, setSportListOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedSport, setSelectedSport] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  // Theme customization
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#123546',
      },
      secondary: {
        main: '#436820',
      },
    },
    typography: {
      // Responsive typography
      h6: {
        fontSize: '1.2rem', // Smaller for mobile
        '@media (min-width:600px)': {
          fontSize: '4rem',
          textAlign: 'center'
        },
      },
    },
  });

  const handleThemeChange = () => {
    setDarkMode(!darkMode);
  };

  const handlePlaceBet = (bet) => {
    if (!selectedBets.some((existingBet) => existingBet.matchId === bet.matchId)) {
      setSelectedBets((prevBets) => [...prevBets, bet]);
      toast.success('Bet placed successfully!', { autoClose: 3000 });
    }
  };

  const handleRemoveBet = (matchId) => {
    console.log(`Removing bet with matchId: ${matchId}`);
    setSelectedBets((prevBets) => {
      const newBets = prevBets.filter((bet) => bet.matchId !== matchId);
      console.log('Updated selectedBets:', newBets);
      return newBets;
    });
    toast.info('Bet removed.', { autoClose: 1000 });
  };

  const handleRemoveAllBets = () => {
    setSelectedBets([]);
    toast.info('All bets removed.', { autoClose: 1000 });
  };

  const handleSubmitBet = (amount) => {
    if (amount <= userBalance && amount > 0) {
      const totalOdds = selectedBets.reduce((total, bet) => total * bet.odds, 1);
      const potentialWinnings = (amount * totalOdds).toFixed(2);
      const newBet = {
        id: Date.now(),
        bets: selectedBets,
        amount,
        totalOdds,
        potentialWinnings,
        status: 'pending',
        timestamp: new Date().toISOString(),
      };
      setPendingBets((prev) => [...prev, newBet]);
      setUserBalance((prev) => prev - amount);
      setSelectedBets([]);
      toast.success('Bet submitted successfully!', { autoClose: 3000 });
    } else {
      toast.error('Insufficient balance or invalid amount.', { autoClose: 3000 });
    }
  };

  const handleCashOut = (betId) => {
    const betToCashOut = pendingBets.find((bet) => bet.id === betId);
    if (betToCashOut) {
      const cashOutAmount = betToCashOut.amount * 0.4;
      setUserBalance((prev) => prev + cashOutAmount);
      updateBetStatus(betId, 'cashed out');
      toast.info(`Bet cashed out: ${cashOutAmount.toFixed(2)} added to your balance.`, { autoClose: 3000 });
    }
  };

  const handleSettleBet = async (betId) => {
    const apiToken = import.meta.env.VITE_API_KEY;
    const betToSettle = pendingBets.find((bet) => bet.id === betId);
    if (betToSettle) {
      try {
        const response = await axios.get(`https://api.cloudbet.com/v1/bets/${betId}`, {
          headers: { Authorization: `Bearer ${apiToken}` },
        });
        const { status } = response.data;
        const isWon = status === 'Won';

        if (isWon) {
          const winnings = betToSettle.amount * betToSettle.totalOdds;
          setUserBalance((prev) => prev + winnings);
          toast.success(`You won! Winnings: ${winnings.toFixed(2)}`, { autoClose: 3000 });
        } else {
          toast.error('Bet lost.', { autoClose: 3000 });
        }

        updateBetStatus(betId, isWon ? 'won' : 'lost');
      } catch (error) {
        console.error('Error fetching bet details:', error);
        toast.error('Failed to settle bet.', { autoClose: 3000 });
      }
    }
  };

  const updateBetStatus = (betId, status) => {
    setPendingBets((prev) =>
      prev.map((bet) => (bet.id === betId ? { ...bet, status } : bet))
    );
  };

  const handleSelectMatch = (match) => setSelectedMatch(match);
  const handleBack = () => setSelectedMatch(null);
  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const toggleSportList = () => setSportListOpen(!sportListOpen);

  const handleAddBet = (selection, marketKey, submarketKey) => {
    const bet = {
      matchId: String(selectedMatch.id), // Convert to string to avoid prop type warnings
      matchName: selectedMatch.name,
      selection: selection.outcome,
      type: `${marketKey.replace('.', ' ')} - ${submarketKey.replace('=', ': ')}`,
      odds: selection.price,
      params: selection.params,
    };
    handlePlaceBet(bet);
  };

  const handleSelectSport = (sport) => {
    setSelectedSport(sport);
    setSelectedMatch(null); // Reset selected match when a new sport is selected
    setDrawerOpen(false); // Close the drawer after selecting a sport
  };

  const handleOpenBetTicket = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseBetTicket = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100vw',
          backgroundColor: darkMode ? '#303030' : '#F2F2F7',
          overflowY: 'auto', // Ensure the main container is scrollable
        }}
      >
        <ToastContainer position="top-right" autoClose={3000} pauseOnHover theme={darkMode ? 'dark' : 'light'} />
        <AppBar position="sticky" sx={{ boxShadow: 'none', padding: 2 }}>
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              sx={{
                flexGrow: 1,
                color: '#f46436189148',
                fontWeight: 600,
              }}
            >
              GalaxyWin
            </Typography>
            <Tooltip title="Toggle Light/Dark Theme">
              <IconButton color="inherit" onClick={handleThemeChange}>
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
          </Toolbar>
          <Tooltip title="Open Bet Ticket">
              <IconButton color="inherit" onClick={handleOpenBetTicket}>
                <ReceiptIcon />
              </IconButton>
            </Tooltip>
        </AppBar>

        <div>
          <PromoSlider /> {/* Add PromoSlider here */}
        </div>

        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          sx={{
            '& .MuiDrawer-paper': {
              width: '80%', // Adjust width for mobile
              maxWidth: 300, // Max width for larger screens
              height: '100%', // Ensure the Drawer takes up the full height
              overflowY: 'auto', // Ensure the content inside the Drawer is scrollable
            },
          }}
        >
          <List>
            <ListItem button>
              <ListItemIcon>
                <AccountBalanceWalletIcon />
              </ListItemIcon>
              <ListItemText primary={`Balance: ${userBalance.toFixed(2)} دينار`} />
            </ListItem>

            <ListItem button onClick={toggleSportList}>
              <ListItemIcon>
                <SportsSoccerIcon />
              </ListItemIcon>
              <ListItemText primary="Accout" />
              {sportListOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={sportListOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button sx={{ pl: 4 }} onClick={() => handleSelectSport('Soccer')}>
                  <ListItemText primary="Login" />
                </ListItem>
                {/* Add more sports here */}
                <h4 className="account__message"  style={{ margin : '10px', padding : ' 10px' }}
                 >You are not currently logged in. Please log in to access your account.</h4>

              </List>
            </Collapse>

            <Divider />

            <ListItem button onClick={() => setSelectedMatch(null)}>
              <ListItemIcon>
                <SportsSoccerIcon />
              </ListItemIcon>
              <ListItemText primary="Soccer Matches" />
            </ListItem>

            <ListItem button>
              <ListItemIcon>
                <ReceiptIcon />
              </ListItemIcon>
              <ListItemText primary="Pending Bets" />
            </ListItem>

            <ListItem>
              <Paper
                sx={{
                  padding: 2,
                  borderRadius: 4,
                  boxShadow: 3,
                  margin: '16px 0',
                  width: '100%',
                  backgroundColor: darkMode ? '#424242' : '#fff',
                }}
              >
                <PendingBets
                  pendingBets={pendingBets}
                  setPendingBets={setPendingBets}
                  onCashOut={handleCashOut}
                  onSettleBet={handleSettleBet}
                />
              </Paper>
            </ListItem>
          </List>
        </Drawer>

        <Container maxWidth="lg" sx={{ marginTop: 3, flexGrow: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {selectedMatch ? (
                  <MatchDetails match={selectedMatch} onBack={handleBack} onAddBet={handleAddBet} />
                ) : (
                  <SoccerMatches onPlaceBet={handlePlaceBet} onSelectMatch={handleSelectMatch} />
                )}
              </motion.div>
            </Grid>

            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ x: 100 }}
                animate={{ x: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {/* Responsive layout */}
              </motion.div>
            </Grid>
          </Grid>
        </Container>

        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleCloseBetTicket}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Paper sx={{ padding: 2, borderRadius: 4, boxShadow: 3 }}>
            <BetTicket
              selectedBets={selectedBets.map((bet) => ({
                ...bet,
                matchId: String(bet.matchId), // Ensure string type
              }))}
              onRemoveBet={handleRemoveBet}
              onRemoveAllBets={handleRemoveAllBets}
              userBalance={userBalance}
              onSubmitBet={handleSubmitBet}
            />
          </Paper>
        </Popover>

        {pendingBets.length > 0 && (
          <Fab
            color="primary"
            aria-label="pending-bets"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
              backgroundColor: '#007AFF',
              '&:hover': {
                backgroundColor: '#0056b3',
              },
            }}
            onClick={() => setSelectedMatch(null)}
          >
            <Tooltip title="View Pending Bets">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ReceiptIcon sx={{ mr: 1 }} />
                <Typography variant="body2">{pendingBets.length}</Typography>
              </Box>
            </Tooltip>
          </Fab>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default Home;

