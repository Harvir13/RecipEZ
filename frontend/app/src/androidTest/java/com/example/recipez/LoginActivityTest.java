package com.example.recipez;


import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withClassName;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.is;

import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;

import androidx.test.espresso.ViewInteraction;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;
import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.uiautomator.By;
import androidx.test.uiautomator.EventCondition;
import androidx.test.uiautomator.UiDevice;
import androidx.test.uiautomator.UiObject;
import androidx.test.uiautomator.UiObject2;
import androidx.test.uiautomator.UiObject2Condition;
import androidx.test.uiautomator.UiObjectNotFoundException;
import androidx.test.uiautomator.UiSelector;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

@LargeTest
@RunWith(AndroidJUnit4.class)
public class LoginActivityTest {

    @Rule
    public ActivityScenarioRule<LoginActivity> mActivityScenarioRule =
            new ActivityScenarioRule<>(LoginActivity.class);

    @Test
    public void loginActivityTest() throws UiObjectNotFoundException {
        onView(allOf(withText("Sign in"), childAtPosition(allOf(withId(R.id.sign_in_button), childAtPosition(withClassName(is("androidx.constraintlayout.widget.ConstraintLayout")), 0)), 0), isDisplayed())).perform(click());
        try {
            Thread.sleep(10000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        UiDevice mDevice = UiDevice.getInstance(InstrumentationRegistry.getInstrumentation());

        UiObject emailEditTextInput = mDevice.findObject(new UiSelector().className("android.widget.EditText").resourceId("identifierId").packageName("com.google.android.gms"));
        emailEditTextInput.setText("recipez321@gmail.com");
        UiObject emailNextButton = mDevice.findObject(new UiSelector().className("android.widget.Button").packageName("com.google.android.gms").text("NEXT"));
        try {
            emailNextButton.clickAndWaitForNewWindow();
        } catch (UiObjectNotFoundException e) {
            emailNextButton = mDevice.findObject(new UiSelector().className("android.widget.Button").packageName("com.google.android.gms").text("Next"));
            emailNextButton.clickAndWaitForNewWindow();
        }

        UiObject passwordEditTextInput = mDevice.findObject(new UiSelector().className("android.widget.EditText").packageName("com.google.android.gms"));
        passwordEditTextInput.setText("breadfruit");
        UiObject passwordNextButton = mDevice.findObject(new UiSelector().className("android.widget.Button").packageName("com.google.android.gms").text("NEXT"));
        try {
            passwordNextButton.clickAndWaitForNewWindow();
        } catch (UiObjectNotFoundException e) {
            passwordNextButton = mDevice.findObject(new UiSelector().className("android.widget.Button").packageName("com.google.android.gms").text("Next"));
            passwordNextButton.clickAndWaitForNewWindow();
        }

        UiObject TOSAgreeButton = mDevice.findObject(new UiSelector().className("android.widget.Button").packageName("com.google.android.gms").text("I agree"));
        TOSAgreeButton.clickAndWaitForNewWindow();

        UiObject moreButton = mDevice.findObject(new UiSelector().className("android.widget.Button").packageName("com.google.android.gms").text("MORE"));
        moreButton.click();
        UiObject acceptButton = mDevice.findObject(new UiSelector().className("android.widget.Button").packageName("com.google.android.gms").text("ACCEPT"));
        acceptButton.clickAndWaitForNewWindow();
    }

    private static Matcher<View> childAtPosition(
            final Matcher<View> parentMatcher, final int position) {

        return new TypeSafeMatcher<View>() {
            @Override
            public void describeTo(Description description) {
                description.appendText("Child at position " + position + " in parent ");
                parentMatcher.describeTo(description);
            }

            @Override
            public boolean matchesSafely(View view) {
                ViewParent parent = view.getParent();
                return parent instanceof ViewGroup && parentMatcher.matches(parent)
                        && view.equals(((ViewGroup) parent).getChildAt(position));
            }
        };
    }
}
