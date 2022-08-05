package com.example.recipez;

import static androidx.test.espresso.Espresso.onData;
import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.closeSoftKeyboard;
import static androidx.test.espresso.action.ViewActions.replaceText;
import static androidx.test.espresso.matcher.ViewMatchers.hasChildCount;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withClassName;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.anything;
import static org.hamcrest.Matchers.is;

import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;

import androidx.test.espresso.IdlingRegistry;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.Assert;

@RunWith(AndroidJUnit4.class)
public class AddIngredientNFRTest {
    int clickCount = 0;

    @Rule
    public ActivityScenarioRule<MainActivity> activityRule =
            new ActivityScenarioRule<>(MainActivity.class);

    @Before
    public void registerIdlingResource() {
        IdlingRegistry.getInstance().register(EspressoIdlingResourceUtil.getIdlingResource());
    }

    @After
    public void unregisterIdlingResource() {
        IdlingRegistry.getInstance().unregister(EspressoIdlingResourceUtil.getIdlingResource());
    }

    @Test
    public void addIngredientClickCount() {
        // Adds "apple" to the user's fridge

        // click #1: open fridge page
        clickWithCounterOnView(allOf(withId(R.id.fridgeFab), childAtPosition(childAtPosition(withId(android.R.id.content), 0), 2), isDisplayed()));

        // click #2: add ingredient button
        clickWithCounterOnView(allOf(withId(R.id.addIngredientButton), childAtPosition(childAtPosition(withClassName(is("android.widget.LinearLayout")), 0), 1), isDisplayed()));

        // click #3: highlight search text input
        clickWithCounterOnView(allOf(withId(R.id.editIngredientName), childAtPosition(childAtPosition(withId(android.R.id.content), 0), 1), isDisplayed()));
        onView(allOf(withId(R.id.editIngredientName), childAtPosition(childAtPosition(withId(android.R.id.content), 0), 1), isDisplayed())).perform(replaceText("apple"), closeSoftKeyboard());

        // click #4: search button
        clickWithCounterOnView(allOf(withId(R.id.addIngredientConfirm), withText("Search"), childAtPosition(childAtPosition(withId(android.R.id.content), 0), 2), isDisplayed()));
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // click #5: select "Apple" from search suggestions
        clickWithCounterOnData(anything());
        try {
            Thread.sleep(4000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // Check that "apple" is added
        onView(allOf(withId(R.id.fridgeRecyclerView), hasChildCount(1)));

        Assert.assertEquals(5, clickCount);
    }

    private void clickWithCounterOnView(Matcher<View> view) {
        onView(view).perform(click());
        clickCount++;
    }

    private void clickWithCounterOnData(Matcher<Object> object) {
        onData(object).inAdapterView(allOf(withId(R.id.selectIngredientList), childAtPosition(withClassName(is("android.widget.RelativeLayout")), 1))).atPosition(0).perform(click());
        clickCount++;
    }

    private static Matcher<View> childAtPosition(final Matcher<View> parentMatcher, final int position) {
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
