"use client";
import { useEffect } from "react";
import { getAnalytics, isSupported } from "firebase/analytics";
import {app} from "../lib/firebase-app"
export function FirebaseAnalytics() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) {
      return;
    }
    void isSupported()
      .then((supported) => {
        if (supported) {
          getAnalytics(app);
        }
      })
      .catch(() => undefined);
  }, []);
  return null;
}
