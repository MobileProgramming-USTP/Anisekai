import AnimeSections, { ANIME_SECTION_CONFIG } from '../../components/explore/AnimeSections';
import CharacterSections, {
  CHARACTER_SECTION_CONFIG,
} from '../../components/explore/CharacterSections';
import MangaSections, { MANGA_SECTION_CONFIG } from '../../components/explore/MangaSections';
import UserSections, { USER_SECTION_CONFIG } from '../../components/explore/UserSections';
import { SCOPE_VALUES } from './constants';

export const SECTION_CONFIG = {
  [SCOPE_VALUES.ANIME]: ANIME_SECTION_CONFIG,
  [SCOPE_VALUES.MANGA]: MANGA_SECTION_CONFIG,
  [SCOPE_VALUES.CHARACTERS]: CHARACTER_SECTION_CONFIG,
  [SCOPE_VALUES.USERS]: USER_SECTION_CONFIG,
};

export const SCOPE_SECTION_COMPONENTS = {
  [SCOPE_VALUES.ANIME]: AnimeSections,
  [SCOPE_VALUES.MANGA]: MangaSections,
  [SCOPE_VALUES.CHARACTERS]: CharacterSections,
  [SCOPE_VALUES.USERS]: UserSections,
};
