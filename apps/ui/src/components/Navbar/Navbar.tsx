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
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import FileUploadOutlined from '@mui/icons-material/FileUploadOutlined';
import CreditCardOutlined from '@mui/icons-material/CreditCardOutlined';
import BarChartOutlined from '@mui/icons-material/BarChartOutlined';
import SettingsOutlined from '@mui/icons-material/SettingsOutlined';
import ButtonBase from '@mui/material/ButtonBase';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Image from 'next/image';
import logo from '../../../public/penny_logo.svg';
import cat from '../../../public/cat.png';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher/LanguageSwitcher';
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { usePathname, useRouter } from 'next/navigation';
import { availableLanguages } from '@/utils/interfaces';

const pageIcons = [
  HomeOutlined,
  FileUploadOutlined,
  CreditCardOutlined,
  BarChartOutlined,
  SettingsOutlined,
];

const SIDEBAR_WIDTH = 260;

interface NavbarProps {
  headerText: Record<string, any>;
}
export const Navbar: React.FC<NavbarProps> = ({ headerText }) => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const pages = [
    headerText.PAGES.HOME,
    headerText.PAGES.UPLOAD_CSV,
    headerText.PAGES.MONEY_JOURNAL,
    headerText.PAGES.PENNYS_VIEW,
    headerText.PAGES.SETTINGS,
  ];
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname() ?? '/';

  const [, firstSegment, ...restSegments] = pathname.split('/');
  const currentPath = availableLanguages.some((l) => l === firstSegment)
    ? `/${restSegments.join('/')}`
    : pathname;
  const isActive = (url: string) =>
    url === '/' ? currentPath === '/' : currentPath.startsWith(url);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = (url: string) => {
    setAnchorElNav(null);
    router.push(url);
  };

  const profileLink = (
    <Tooltip
      title={
        user ? headerText.TOOLTIP.SIGN_IN_USER : headerText.TOOLTIP.SIGN_IN
      }
    >
      <ButtonBase
        href={user ? `/profile` : `/signin`}
        aria-label="account of current user"
        sx={{
          gap: 1.5,
          px: 1,
          py: 0.75,
          borderRadius: 3,
          justifyContent: 'flex-start',
          minWidth: 0,
          color: 'inherit',
          '&:hover': { bgcolor: 'sidebar.hover' },
        }}
      >
        <AccountCircle sx={{ fontSize: 32 }} />
        <Typography noWrap fontWeight={700}>
          {user ? user.userName : headerText.PAGES.SIGN_IN.NAME}
        </Typography>
      </ButtonBase>
    </Tooltip>
  );

  return (
    <Box
      component="header"
      sx={{ flexShrink: 0, width: { md: SIDEBAR_WIDTH } }}
    >
      {/* mobile top bar */}
      <AppBar
        position="static"
        sx={{
          display: { xs: 'block', md: 'none' },
          bgcolor: 'sidebar.background',
          color: 'sidebar.text',
          boxShadow: 'none',
        }}
      >
        <Toolbar sx={{ gap: 1, justifyContent: 'space-between' }}>
          {user && (
            <>
              <IconButton
                size="large"
                aria-label="open navigation menu"
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
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                open={Boolean(anchorElNav)}
                onClose={() => setAnchorElNav(null)}
              >
                {pages.map((page, index) => (
                  <MenuItem
                    key={page.NAME + index}
                    selected={isActive(page.URL)}
                    onClick={() => handleCloseNavMenu(page.URL)}
                  >
                    <Typography sx={{ textAlign: 'center' }}>
                      {page.NAME}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          <Box
            component="a"
            href="/"
            sx={{ display: 'flex', mr: 'auto', borderRadius: 2, overflow: 'hidden' }}
          >
            <Image src={logo} alt="logo" width={48} height={48} />
          </Box>

          <LanguageSwitcher />
          {profileLink}
        </Toolbar>
      </AppBar>

      {/* desktop sidebar */}
      <Box
        component="nav"
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          bgcolor: 'sidebar.background',
          color: 'sidebar.text',
          px: 2,
          pt: 3,
          pb: 2,
        }}
      >
        <Box
          component="a"
          href="/"
          aria-label="Penny"
          sx={{
            px: 1.5,
            mb: 4,
            color: 'inherit',
            textDecoration: 'none',
            fontFamily: (t) => t.typography.h1.fontFamily,
            fontSize: 40,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          Penny
        </Box>

        {user && (
          <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {pages.map((page, index) => {
              const Icon = pageIcons[index];
              const active = isActive(page.URL);
              return (
                <li key={page.NAME + index}>
                  <ButtonBase
                    onClick={() => handleCloseNavMenu(page.URL)}
                    aria-current={active ? 'page' : undefined}
                    sx={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      gap: 2,
                      px: 2,
                      py: 1.25,
                      mb: 0.5,
                      borderRadius: 3,
                      fontSize: 16,
                      fontWeight: 600,
                      color: active ? 'sidebar.activeText' : 'sidebar.text',
                      bgcolor: active ? 'sidebar.activeBackground' : 'transparent',
                      transition: 'background-color 0.2s, color 0.2s',
                      '&:hover': {
                        bgcolor: active
                          ? 'sidebar.activeBackground'
                          : 'sidebar.hover',
                      },
                    }}
                  >
                    <Icon />
                    {page.NAME}
                  </ButtonBase>
                </li>
              );
            })}
          </Box>
        )}

        <Box
          sx={{
            mt: 'auto',
            minHeight: 0,
            display: 'flex',
            alignItems: 'flex-end',
            '@media (max-height: 720px)': { display: 'none' },
          }}
        >
          <Image
            src={cat}
            alt=""
            aria-hidden
            style={{ width: '85%', height: 'auto', maxHeight: '32vh', objectFit: 'contain', objectPosition: 'left bottom' }}
          />
        </Box>

        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: '1px solid rgba(255,255,255,0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          {profileLink}
          <LanguageSwitcher />
        </Box>
      </Box>
    </Box>
  );
};
