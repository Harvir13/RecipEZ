package com.example.recipez;


import static androidx.test.espresso.Espresso.onData;
import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.closeSoftKeyboard;
import static androidx.test.espresso.action.ViewActions.replaceText;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.hasChildCount;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withClassName;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withParent;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.anything;
import static org.hamcrest.Matchers.is;

import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;

import androidx.test.espresso.DataInteraction;
import androidx.test.espresso.IdlingRegistry;
import androidx.test.espresso.UiController;
import androidx.test.espresso.ViewAction;
import androidx.test.espresso.ViewInteraction;
import androidx.test.espresso.contrib.RecyclerViewActions;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;
import org.hamcrest.core.IsInstanceOf;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

@LargeTest
@RunWith(AndroidJUnit4.class)
public class ManageIngredientsUseCaseTest {

    @Rule
    public ActivityScenarioRule<MainActivity> mActivityScenarioRule =
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
    public void manageIngredientsUseCaseTest() {
        // 1. User opens fridge/pantry fragment by tapping on fridge FAB
        ViewInteraction floatingActionButton = onView(
                allOf(withId(R.id.fridgeFab),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                2),
                        isDisplayed()));
        floatingActionButton.perform(click());

        // 2. The user taps the add button
        ViewInteraction appCompatImageButton = onView(
                allOf(withId(R.id.addIngredientButton),
                        childAtPosition(
                                childAtPosition(
                                        withClassName(is("android.widget.LinearLayout")),
                                        0),
                                1),
                        isDisplayed()));
        appCompatImageButton.perform(click());

        // 3. The user enters “asdfwaefear” and presses the “SEARCH” button
        ViewInteraction appCompatEditText = onView(
                allOf(withId(R.id.editIngredientName),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                1),
                        isDisplayed()));
        appCompatEditText.perform(replaceText("asdfwaefear"), closeSoftKeyboard());

        ViewInteraction materialButton = onView(
                allOf(withId(R.id.addIngredientConfirm), withText("Search"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                2),
                        isDisplayed()));
        materialButton.perform(click());

        // The dialog gets dismissed, reappears, and a toast is shown at the bottom stating that no ingredients were found and to try another string.
        onView(withText("No ingredients found, please try a different search")).inRoot(new BookmarkUseCaseTest.ToastMatcher()).check(matches(isDisplayed()));

        // 4.The user enters “apple” and presses the “SEARCH” button
        ViewInteraction appCompatEditText1 = onView(
                allOf(withId(R.id.editIngredientName),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                1),
                        isDisplayed()));
        appCompatEditText1.perform(replaceText("apple"), closeSoftKeyboard());

        ViewInteraction materialButton1 = onView(
                allOf(withId(R.id.addIngredientConfirm), withText("Search"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                2),
                        isDisplayed()));
        materialButton1.perform(click());

        // 5. The user selects “apple” on the ListView
        DataInteraction textView = onData(anything())
                .inAdapterView(allOf(withId(R.id.selectIngredientList),
                        childAtPosition(
                                withClassName(is("android.widget.RelativeLayout")),
                                1)))
                .atPosition(0);
        textView.perform(click());

        // delay for RecyclerView animation to play out/render
        try {
            Thread.sleep(4000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // A new item should show on the main fragment showing an image of an apple, the title “Apple”, an expiry date returned from the external service, and a red garbage icon on the right.
        ViewInteraction textView2 = onView(
                allOf(withId(R.id.ingredientName), withText("Apple"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.widget.FrameLayout.class))),
                        isDisplayed()));
        textView2.check(matches(withText("Apple")));

        // 6. Repeat steps 4 and 5, but this time search and select “breadfruit”
        ViewInteraction appCompatImageButton2 = onView(
                allOf(withId(R.id.addIngredientButton),
                        childAtPosition(
                                childAtPosition(
                                        withClassName(is("android.widget.LinearLayout")),
                                        0),
                                1),
                        isDisplayed()));
        appCompatImageButton2.perform(click());

        ViewInteraction appCompatEditText2 = onView(
                allOf(withId(R.id.editIngredientName),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                1),
                        isDisplayed()));
        appCompatEditText2.perform(replaceText("breadfruit"), closeSoftKeyboard());

        ViewInteraction materialButton2 = onView(
                allOf(withId(R.id.addIngredientConfirm), withText("Search"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                2),
                        isDisplayed()));
        materialButton2.perform(click());

        DataInteraction textView3 = onData(anything())
                .inAdapterView(allOf(withId(R.id.selectIngredientList),
                        childAtPosition(
                                withClassName(is("android.widget.RelativeLayout")),
                                1)))
                .atPosition(0);
        textView3.perform(click());

        // delay for expiry editing dialog to render
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // 7. Enter an invalid date (more or less than 8 characters for MMDDYYYY, such as 1 or 1010101010) and press the button
        ViewInteraction appCompatEditText3 = onView(
                allOf(withId(R.id.newIngredientExpiry),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                1),
                        isDisplayed()));
        appCompatEditText3.perform(replaceText("1"), closeSoftKeyboard());

        ViewInteraction materialButton3 = onView(
                allOf(withId(R.id.editIngredientSubmit), withText("Update"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                2),
                        isDisplayed()));
        materialButton3.perform(click());

        // The dialog should not dismiss and a toast should inform the user to enter a valid date.
        onView(withText("Please enter a valid date!")).inRoot(new BookmarkUseCaseTest.ToastMatcher()).check(matches(isDisplayed()));

        // Enter a valid date (01012023) and press the button
        ViewInteraction appCompatEditText4 = onView(
                allOf(withId(R.id.newIngredientExpiry), withText("1"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                1),
                        isDisplayed()));
        appCompatEditText4.perform(replaceText("01012023"));

        ViewInteraction appCompatEditText5 = onView(
                allOf(withId(R.id.newIngredientExpiry), withText("01012023"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                1),
                        isDisplayed()));
        appCompatEditText5.perform(closeSoftKeyboard());

        ViewInteraction materialButton4 = onView(
                allOf(withId(R.id.editIngredientSubmit), withText("Update"),
                        childAtPosition(
                                childAtPosition(
                                        withId(android.R.id.content),
                                        0),
                                2),
                        isDisplayed()));
        materialButton4.perform(click());

        // delay for items to appear on the list to delete
        try {
            Thread.sleep(4000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        // The dialog should be dismissed and an entry of “Breadfruit” should appear on the list with the expiry date January 1, 2023.
        ViewInteraction textView4 = onView(
                allOf(withId(R.id.ingredientName), withText("Breadfruit"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.widget.FrameLayout.class))),
                        isDisplayed()));
        textView4.check(matches(withText("Breadfruit")));
        ViewInteraction textView5 = onView(
                allOf(withId(R.id.ingredientExpiry), withText("January 1, 2023"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.widget.FrameLayout.class))),
                        isDisplayed()));
        textView5.check(matches(withText("January 1, 2023")));

        onView(allOf(withId(R.id.fridgeRecyclerView), hasChildCount(2)));

        // 9. Press the trash icon on the “Apple” entry
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

        onView(allOf(withId(R.id.fridgeRecyclerView), hasChildCount(1)));

        // 10. Repeat step 9 for “Breadfruit”
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

        onView(allOf(withId(R.id.fridgeRecyclerView), hasChildCount(0)));

        // delay to allow Volley request to go through for deleting the item on the backend
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
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
