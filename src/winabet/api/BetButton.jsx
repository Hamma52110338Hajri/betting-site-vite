import PropTypes from 'prop-types';
import { Button, Typography } from '@mui/material';

const BetButton = ({ selection, onAddBet, title }) => {
  const handleClick = () => {
    console.log("Outcome:", selection.outcome);
    console.log("Params:", selection.params);
    console.log("Price:", selection.price.toFixed(2));
    onAddBet(selection);
  };

  return (
    <Button
      variant="outlined"
      fullWidth
      onClick={handleClick}
      style={{
        height: '50px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography variant="caption" style={{ color: '#4caf50' }}>{title}</Typography>
      <Typography variant="body2" style={{ color: '#fff' }}>{selection.price.toFixed(2)}</Typography>
    </Button>
  );
};

BetButton.propTypes = {
  selection: PropTypes.shape({
    maxStake: PropTypes.number.isRequired,
    minStake: PropTypes.number.isRequired,
    outcome: PropTypes.string.isRequired,
    params: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    probability: PropTypes.number.isRequired,
    side: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  onAddBet: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export default BetButton;
