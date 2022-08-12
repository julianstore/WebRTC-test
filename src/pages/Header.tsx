import { Typography, Grid, Box } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import { useContext } from 'react';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

const useStyles = makeStyles(() =>
  createStyles({
    logo: {
      fontWeight: 700,
      fontSize: 64,
      display: 'flex',
      background: 'linear-gradient(296.93deg, #47FFF5 24%, #FF1F70 65.95%)',
      width: 400,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginLeft: 50
    },
    title: {
      color: '#C8DCFF',
      fontWeight: 500,
      fontSize: '36px !important',
      marginTop: '25px !important'
    },
    logout: {
      color: '#48FFF5 !important',
      float: 'right',
      marginTop: '-50px !important',
      cursor: 'pointer',
      display: 'flex',
      paddingRight: 50
    }
  })
);
export const Header = () => {
  const classes = useStyles();
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const handleLogout = async () => {
    authContext.signout(() => {
      navigate('/');
    });
  };

  return (
    <>
      <Grid container item xs={6} style={{ display: 'flex' }}>
        <Box className={classes.logo}>WeDream</Box>
        <Box>
          <Typography className={classes.title}>
            Audio Streaming Portal
          </Typography>
        </Box>
      </Grid>
      {authContext.isAuthenticated && (
        <Grid item xs={2}>
          <Box className={classes.logout} onClick={handleLogout}>
            <PersonOutlineIcon fontSize="large" />
            <Typography style={{ marginTop: 5, color: 'white' }}>
              Sign Out
            </Typography>
          </Box>
        </Grid>
      )}
    </>
  );
};
