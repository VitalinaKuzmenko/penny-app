import type { SvgIconComponent } from '@mui/icons-material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BakeryDiningIcon from '@mui/icons-material/BakeryDining';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import BoltIcon from '@mui/icons-material/Bolt';
import BuildIcon from '@mui/icons-material/Build';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import CategoryIcon from '@mui/icons-material/Category';
import CelebrationIcon from '@mui/icons-material/Celebration';
import ChairIcon from '@mui/icons-material/Chair';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DevicesIcon from '@mui/icons-material/Devices';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FlightIcon from '@mui/icons-material/Flight';
import HomeIcon from '@mui/icons-material/Home';
import HotelIcon from '@mui/icons-material/Hotel';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import LocalPizzaIcon from '@mui/icons-material/LocalPizza';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import MovieIcon from '@mui/icons-material/Movie';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PaymentsIcon from '@mui/icons-material/Payments';
import PedalBikeIcon from '@mui/icons-material/PedalBike';
import PetsIcon from '@mui/icons-material/Pets';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ReceiptIcon from '@mui/icons-material/Receipt';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SavingsIcon from '@mui/icons-material/Savings';
import SchoolIcon from '@mui/icons-material/School';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SpaIcon from '@mui/icons-material/Spa';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import StarIcon from '@mui/icons-material/Star';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TrainIcon from '@mui/icons-material/Train';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WifiIcon from '@mui/icons-material/Wifi';
import WorkIcon from '@mui/icons-material/Work';
import {
  CategoryIconName,
  CATEGORY_ICONS,
  DEFAULT_CATEGORY_ICON,
} from 'schemas';

// Every curated name must have a component, so a missing one fails the type-check
export const CATEGORY_ICON_COMPONENTS: Record<
  CategoryIconName,
  SvgIconComponent
> = {
  restaurant: RestaurantIcon,
  local_grocery_store: LocalGroceryStoreIcon,
  local_cafe: LocalCafeIcon,
  fastfood: FastfoodIcon,
  local_pizza: LocalPizzaIcon,
  bakery_dining: BakeryDiningIcon,
  local_bar: LocalBarIcon,
  home: HomeIcon,
  bolt: BoltIcon,
  water_drop: WaterDropIcon,
  wifi: WifiIcon,
  chair: ChairIcon,
  cleaning_services: CleaningServicesIcon,
  local_laundry_service: LocalLaundryServiceIcon,
  build: BuildIcon,
  directions_bus: DirectionsBusIcon,
  directions_car: DirectionsCarIcon,
  local_gas_station: LocalGasStationIcon,
  train: TrainIcon,
  flight: FlightIcon,
  local_taxi: LocalTaxiIcon,
  pedal_bike: PedalBikeIcon,
  local_parking: LocalParkingIcon,
  shopping_bag: ShoppingBagIcon,
  checkroom: CheckroomIcon,
  spa: SpaIcon,
  devices: DevicesIcon,
  phone_iphone: PhoneIphoneIcon,
  card_giftcard: CardGiftcardIcon,
  medical_services: MedicalServicesIcon,
  local_pharmacy: LocalPharmacyIcon,
  fitness_center: FitnessCenterIcon,
  favorite: FavoriteIcon,
  sports_esports: SportsEsportsIcon,
  movie: MovieIcon,
  music_note: MusicNoteIcon,
  menu_book: MenuBookIcon,
  sports_soccer: SportsSoccerIcon,
  beach_access: BeachAccessIcon,
  hotel: HotelIcon,
  celebration: CelebrationIcon,
  receipt: ReceiptIcon,
  payments: PaymentsIcon,
  credit_card: CreditCardIcon,
  account_balance: AccountBalanceIcon,
  savings: SavingsIcon,
  request_quote: RequestQuoteIcon,
  subscriptions: SubscriptionsIcon,
  swap_horiz: SwapHorizIcon,
  family_restroom: FamilyRestroomIcon,
  child_care: ChildCareIcon,
  school: SchoolIcon,
  work: WorkIcon,
  pets: PetsIcon,
  volunteer_activism: VolunteerActivismIcon,
  category: CategoryIcon,
  star: StarIcon,
  more_horiz: MoreHorizIcon,
};

const isCategoryIconName = (name: string): name is CategoryIconName =>
  (CATEGORY_ICONS as readonly string[]).includes(name);

// Unknown or missing names fall back to the generic icon
export const getCategoryIconComponent = (
  name: string | null | undefined,
): SvgIconComponent =>
  CATEGORY_ICON_COMPONENTS[
    name && isCategoryIconName(name) ? name : DEFAULT_CATEGORY_ICON
  ];
