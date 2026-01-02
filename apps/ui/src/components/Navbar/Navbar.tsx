/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Image from 'next/image';
import logo from '../../../public/penny_logo.svg';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher/LanguageSwitcher';
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';

interface NavbarProps {
  headerText: Record<string, any>;
}
export const Navbar: React.FC<NavbarProps> = ({ headerText }) => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const pages = [
    headerText.PAGES.HOME,
    headerText.PAGES.UPLOAD_CSV,
    headerText.PAGES.PENNYS_VIEW,
  ];
  const { user } = useAuth();
  const router = useRouter();

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = (url: string) => {
    setAnchorElNav(null);
    router.push(url);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <Image src={logo} alt="logo" width={90} height={90} />
          </Typography>

          {/* mobile pages */}
          {user && (
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>

              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{ display: { xs: 'block', md: 'none' } }}
              >
                {pages.map((page, index) => (
                  <MenuItem
                    key={page.NAME + index}
                    onClick={() => handleCloseNavMenu(page.URL)}
                  >
                    <Typography sx={{ textAlign: 'center' }}>
                      {page.NAME}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}

          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <Image src={logo} alt="logo" width={90} height={90} />
          </Typography>

          {/* desktop pages */}
          {user ? (
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page, index) => (
                <Button
                  key={page.NAME + index}
                  onClick={() => handleCloseNavMenu(page.URL)}
                  sx={{
                    my: 2,
                    color: 'white',
                    display: 'block',
                    '&:hover': {
                      color: 'grey.400',
                    },
                    transition: 'color 0.3s',
                  }}
                >
                  {page.NAME}
                </Button>
              ))}
            </Box>
          ) : (
            <Box sx={{ flexGrow: 1 }} />
          )}

          <Box
            sx={{
              flexGrow: 0,
              display: 'flex',
              gap: '15px',
              alignItems: 'center',
            }}
          >
            <LanguageSwitcher />
            <Tooltip
              title={
                user
                  ? headerText.TOOLTIP.SIGN_IN_USER
                  : headerText.TOOLTIP.SIGN_IN
              }
            >
              <Box>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  color="inherit"
                  sx={{ p: 0 }}
                  href={user ? `/profile` : `/signin`}
                >
                  <AccountCircle />
                  <Typography sx={{ ml: 1 }}>
                    {user ? user.userName : headerText.PAGES.SIGN_IN.NAME}
                  </Typography>
                </IconButton>
              </Box>
            </Tooltip>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
