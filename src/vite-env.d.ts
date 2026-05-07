/// <reference types="vite/client" />

// Local type declaration for mammoth browser bundle
declare module "mammoth/mammoth.browser" {
  const mammoth: any;
  export default mammoth;
}

declare module "*.md?raw" {
  const content: string;
  export default content;
}
