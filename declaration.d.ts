export {};

declare global {
  interface DefaultObject {
    [key: string]: any;
  }

  interface ImagesData {
    [key: number]: Map<number, DefaultObject>;
    isEmpty?: boolean;
  }
}
