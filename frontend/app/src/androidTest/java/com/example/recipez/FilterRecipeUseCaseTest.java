package com.example.recipez;

import static androidx.test.espresso.Espresso.onData;
import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.closeSoftKeyboard;
import static androidx.test.espresso.action.ViewActions.replaceText;
import static androidx.test.espresso.action.ViewActions.scrollTo;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.hasChildCount;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withClassName;
import static androidx.test.espresso.matcher.ViewMatchers.withContentDescription;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.anything;
import static org.hamcrest.Matchers.is;

import android.os.IBinder;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.view.WindowManager;

import androidx.test.espresso.IdlingRegistry;
import androidx.test.espresso.Root;
import androidx.test.espresso.UiController;
import androidx.test.espresso.ViewAction;
import androidx.test.espresso.contrib.RecyclerViewActions;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

@LargeTest
@RunWith(AndroidJUnit4.class)
public class FilterRecipeUseCaseTest {
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

    @Before
    public void addTestIngredients() {
        // Adds "apple", "cinnamon", and "beef brisket" to the user's fridge
        onView(allOf(withId(R.id.fridgeFab), childAtPosition(childAtPosition(withId(android.R.id.content), 0), 2), isDisplayed())).perform(click());
        // apple
        onView(allOf(withId(R.id.addIngredientButton), childAtPosition(childAtPosition(withClassName(is("android.widget.LinearLayout")), 0), 1), isDisplayed())).perform(click());
        onView(allOf(withId(R.id.editIngredientName), childAtPosition(childAtPosition(withId(android.R.id.content), 0), 1), isDisplayed())).perform(replaceText("apple"), closeSoftKeyboard());
        onView(allOf(withId(R.id.addIngredientConfirm), withText("Search"), childAtPosition(childAtPosition(withId(android.R.id.content), 0), 2), isDisplayed())).perform(click());
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        onData(anything()).inAdapterView(allOf(withId(R.id.selectIngredientList), childAtPosition(withClassName(is("android.widget.RelativeLayout")), 1))).atPosition(0).perform(click());
        try {
            Thread.sleep(4000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        // cocoa
        onView(allOf(withId(R.id.addIngredientButton), childAtPosition(childAtPosition(withClassName(is("android.widget.LinearLayout")), 0), 1), isDisplayed())).perform(click());
        onView(allOf(withId(R.id.editIngredientName), childAtPosition(childAtPosition(withId(android.R.id.content), 0), 1), isDisplayed())).perform(replaceText("cinnamon"), closeSoftKeyboard());
        onView(allOf(withId(R.id.addIngredientConfirm), withText("Search"), childAtPosition(childAtPosition(withId(android.R.id.content), 0), 2), isDisplayed())).perform(click());
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        onData(anything()).inAdapterView(allOf(withId(R.id.selectIngredientList), childAtPosition(withClassName(is("android.widget.RelativeLayout")), 1))).atPosition(0).perform(click());
        try {
            Thread.sleep(4000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // beef brisket
        onView(allOf(withId(R.id.addIngredientButton), childAtPosition(childAtPosition(withClassName(is("android.widget.LinearLayout")), 0), 1), isDisplayed())).perform(click());
        onView(allOf(withId(R.id.editIngredientName), childAtPosition(childAtPosition(withId(android.R.id.content), 0), 1), isDisplayed())).perform(replaceText("beef brisket"), closeSoftKeyboard());
        onView(allOf(withId(R.id.addIngredientConfirm), withText("Search"), childAtPosition(childAtPosition(withId(android.R.id.content), 0), 2), isDisplayed())).perform(click());
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        onData(anything()).inAdapterView(allOf(withId(R.id.selectIngredientList), childAtPosition(withClassName(is("android.widget.RelativeLayout")), 1))).atPosition(0).perform(click());
        try {
            Thread.sleep(4000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // Check that three ingredients have been added
        onView(allOf(withId(R.id.fridgeRecyclerView), hasChildCount(3)));
    }

    @After
    public void removeTestIngredients() {
        onView(allOf(withId(R.id.fridgeFab), childAtPosition(childAtPosition(withId(android.R.id.content), 0), 2), isDisplayed())).perform(click());
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        for (int i = 0; i < 3; i++) {
            onView(withId(R.id.fridgeRecyclerView))
                    .perform(
                            RecyclerViewActions.actionOnItemAtPosition(
                                    0,
                                    new ViewAction() {
                                        @Override
                                        public Matcher<View> getConstraints() {
                                            return null;
                                        }

                                        @Override
                                        public String getDescription() {
                                            return "Click on specific button";
                                        }

                                        @Override
                                        public void perform(UiController uiController, View view) {
                                            View button = view.findViewById(R.id.ingredientDelete);
                                            button.performClick();
                                        }
                                    })
                    );

            try {
                Thread.sleep(2000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    @Test
    public void FilterRecipeUseCaseLargeTest() {
        // Open recipe main page
        onView(allOf(withId(R.id.recipes), withContentDescription("Recipes"), childAtPosition(childAtPosition(withId(R.id.bottomNavigationView), 0), 0), isDisplayed())).perform(click());

        // Open filter dialog, press search without selecting any filter
        // Check for correct toast message
        onView(allOf(withId(R.id.recipe_fragment_filter_button), childAtPosition(childAtPosition(withClassName(is("android.widget.LinearLayout")), 0), 1), isDisplayed())).perform(click());
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        onView(allOf(withId(R.id.add_to_bookmark_confirm_button), withText("Search"), childAtPosition(childAtPosition(withClassName(is("android.widget.LinearLayout")), 2), 0), isDisplayed())).perform(click());
        onView(withText("No recipes found!")).inRoot(new FilterRecipeUseCaseTest.ToastMatcher()).check(matches(isDisplayed()));

        // Open filter dialog, select "Dairy free" and "apple" then press search
        // Check that search results is not empty
        onView(allOf(withId(R.id.recipe_fragment_filter_button), childAtPosition(childAtPosition(withClassName(is("android.widget.LinearLayout")), 0), 1), isDisplayed())).perform(click());
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        onView(allOf(withId(R.id.dialog_filter_dairy_free_checkbox), withText("Dairy free"), childAtPosition(childAtPosition(withClassName(is("android.widget.LinearLayout")), 1), 0))).perform(scrollTo(), click());
        onView(allOf(withId(R.id.filter_ingredient_item_checkbox), withText("apple"), childAtPosition(childAtPosition(withId(R.id.dialog_filter_ingredients_recycler_view), 0), 0), isDisplayed())).perform(click());
        onView(allOf(withId(R.id.add_to_bookmark_confirm_button), withText("Search"), childAtPosition(childAtPosition(withClassName(is("android.widget.LinearLayout")), 2), 0), isDisplayed())).perform(click());
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        onView(allOf(withId(R.id.recipe_card), childAtPosition(childAtPosition(withId(R.id.recipe_fragment_recycler_view), 0), 0), isDisplayed()));

        // Open filter dialog, select "Vegetarian" and "beef brisket" then press search
        // Check that search results is not empty
        onView(allOf(withId(R.id.recipe_fragment_filter_button), childAtPosition(childAtPosition(withClassName(is("android.widget.LinearLayout")), 0), 1), isDisplayed())).perform(click());
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        onView(allOf(withId(R.id.dialog_filter_vegetarian_checkbox), withText("Vegetarian"), childAtPosition(childAtPosition(withClassName(is("android.widget.LinearLayout")), 2), 0))).perform(scrollTo(), click());
        onView(allOf(withId(R.id.filter_ingredient_item_checkbox), withText("beef brisket"), childAtPosition(childAtPosition(withId(R.id.dialog_filter_ingredients_recycler_view), 2), 0), isDisplayed())).perform(click());
        onView(allOf(withId(R.id.add_to_bookmark_confirm_button), withText("Search"), childAtPosition(childAtPosition(withClassName(is("android.widget.LinearLayout")), 2), 0), isDisplayed())).perform(click());
        onView(withText("No recipes found!")).inRoot(new FilterRecipeUseCaseTest.ToastMatcher()).check(matches(isDisplayed()));
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

    public static class ToastMatcher extends TypeSafeMatcher<Root> {
        @Override
        public void describeTo(Description description) {
            description.appendText("is toast");
        }

        @Override
        public boolean matchesSafely(Root root) {
            int type = root.getWindowLayoutParams().get().type;
            if ((type == WindowManager.LayoutParams.TYPE_TOAST)) {
                IBinder windowToken = root.getDecorView().getWindowToken();
                IBinder appToken = root.getDecorView().getApplicationWindowToken();
                if (windowToken == appToken) {
                    return true;
                }
            }
            return false;
        }
    }
}
