export interface Link {
  url: string
  rel: string
  [queryParam: string]: string
}
export interface Links {
  [rel: string]: Link
}
declare const parseLinkHeader: (linkHeader: any) => Links | null
export default parseLinkHeader
