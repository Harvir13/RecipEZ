package com.example.recipez;

import androidx.test.espresso.IdlingResource;

public class EspressoIdlingResourceUtil {

    private static final String RESOURCE = "GLOBAL";

    private static SimpleCountingIdlingResource mCountingIdlingResource =
            new SimpleCountingIdlingResource(RESOURCE);

    public static void increment() {
        mCountingIdlingResource.increment();
    }

    public static void decrement() {
        if (!mCountingIdlingResource.isIdleNow()) {
            mCountingIdlingResource.decrement();
        }
    }

    public static IdlingResource getIdlingResource() {
        return mCountingIdlingResource;
    }
}
