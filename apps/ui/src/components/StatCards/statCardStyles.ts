import incomeIcon from '../../../public/income_left_icon.png';
import incomePlant from '../../../public/income_right_plant.png';
import expenseIcon from '../../../public/expense_left_icon.png';
import expenseWallet from '../../../public/expense_right_wallet.png';
import savingsIcon from '../../../public/savings_left_icon.png';
import savingsCoins from '../../../public/savings_right_coins.png';
import transactionsIcon from '../../../public/icon_left_trans.png';
import transactionsArt from '../../../public/icon_right_trans.png';

// Shared look for each kind of stat card, so the same figure looks the same on every page
export const STAT_CARD_STYLES = {
  income: {
    bg: 'linear-gradient(135deg, #EEF8EC 0%, #E1F2DE 100%)',
    icon: incomeIcon,
    illustration: incomePlant,
  },
  expense: {
    bg: 'linear-gradient(135deg, #FDEFF1 0%, #FBE1E6 100%)',
    icon: expenseIcon,
    illustration: expenseWallet,
  },
  savings: {
    bg: 'linear-gradient(135deg, #F6EEFC 0%, #ECDFF9 100%)',
    icon: savingsIcon,
    illustration: savingsCoins,
  },
  transactions: {
    bg: 'linear-gradient(135deg, #F7F0FB 0%, #F2E6F5 100%)',
    icon: transactionsIcon,
    illustration: transactionsArt,
  },
} as const;
