// import { ApiPossibleResponseData, ApiRes } from "@/types/api.types";
// import qs from "qs";

// export const buildQueryString = (
//   filters: object,
//   sort?: string,
//   limit?: number
// ) => {
//   return qs.stringify(
//     {
//       where: filters,
//       ...(sort ? { sort } : {}),
//       ...(limit ? { limit } : {}),
//     },
//     { addQueryPrefix: true }
//   );

//   // other way to transform queryString
//   // const queryString = new URLSearchParams();

//   // const query = {
//   //   where: filters,
//   // };

//   // function recurse(currentObj: object, currentPrefix: string) {
//   //   for (const [key, value] of Object.entries(currentObj)) {
//   //     const newPrefix = currentPrefix ? `${currentPrefix}[${key}]` : key;

//   //     if (typeof value === "object" && value !== null) {
//   //       recurse(value, newPrefix);
//   //     } else {
//   //       queryString.append(newPrefix, value);
//   //     }
//   //   }
//   // }
//   // recurse(query, "");

//   // return "?" + queryString.toString();
// };

// export const retrieveDataFromRequest = (
//   res: ApiRes
// ): ApiPossibleResponseData => {
//   return res.data.docs;
// };
