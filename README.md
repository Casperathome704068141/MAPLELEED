# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Travel booking setup

Set the Duffel access token before running the development server:

```bash
export DUFFEL_ACCESS_TOKEN="duffel_live_xxx"
```

The Travel page (`/travel`) now uses Duffel’s API to search, review, and book flights end to end.
Markup is applied per traveller: $75 when the base fare is under $999 and $100 once fares reach $999 or
more.
