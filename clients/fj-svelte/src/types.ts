export interface Icon {
  name?: string;
  dataUri?: string;
  width?: string;
  height?: string;
  alt?: string;
  ariaLabel?: string;
  darkenOnHover?: boolean;
}

export type IconList = Record<string, Icon>;
