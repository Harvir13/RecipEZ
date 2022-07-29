package com.example.recipez;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.closeSoftKeyboard;
import static androidx.test.espresso.action.ViewActions.pressBack;
import static androidx.test.espresso.action.ViewActions.pressImeActionButton;
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
import static org.hamcrest.Matchers.is;

import android.os.IBinder;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.view.WindowManager;

import androidx.test.espresso.IdlingRegistry;
import androidx.test.espresso.IdlingResource;
import androidx.test.espresso.Root;
import androidx.test.espresso.ViewInteraction;
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

@RunWith(AndroidJUnit4.class)
public class BookmarkUseCaseTest {
    @Rule
    public ActivityScenarioRule<MainActivity> activityRule =
            new ActivityScenarioRule<>(MainActivity.class);

    @Before
    public void registerIdlingResource() {
        IdlingRegistry.getInstance().register(EspressoIdlingResource.getIdlingResource());
    }

    @After
    public void unregisterIdlingResource() {
        IdlingRegistry.getInstance().unregister(EspressoIdlingResource.getIdlingResource());
    }

    @Test
    public void CreateNewFolderTest() {
        // (Assumes that the user has no pre-existing folders)
        // Click on “Profile” -> “Bookmarked Recipes” -> “New Folder”
        // Click on “Done” button without typing anything in text input field
        // Check for correct toast message and that folder is not created
        onView(withId(R.id.profile)).perform(click());
        onView(withId(R.id.bookmarked_list_card)).perform(click());
        onView(withId(R.id.add_folder_dialog_button)).check(matches(withText("New Folder"))).perform(click());
        onView(withId(R.id.dialog_new_folder_confirm_button)).check(matches(withText("Done"))).perform(click());
        onView(withText(R.string.empty_folder_name_toast_msg)).inRoot(new ToastMatcher()).check(matches(isDisplayed()));
        onView(withId(R.id.dialog_new_folder_confirm_button)).check(matches(withText("Done"))).perform(pressBack());
        onView(withId(R.id.bookmark_list_recycler_view)).check(matches(hasChildCount(0)));

        // Click on “New Folder” button
        // Type “Desserts” in “Enter folder name” text input field -> Click on “Done”
        // Check that new folder called "Desserts" is created
        onView(withId(R.id.add_folder_dialog_button)).check(matches(withText("New Folder"))).perform(click());
        onView(withId(R.id.dialog_new_folder_name_input)).perform(click());
        onView((withId(R.id.dialog_new_folder_name_input))).perform(replaceText("Desserts"), closeSoftKeyboard());
        onView(withId(R.id.dialog_new_folder_confirm_button)).check(matches(withText("Done"))).perform(click());
        onView(allOf(withId(R.id.folder_name_text), withId(R.id.linear_folder_layout), childAtPosition(childAtPosition(withId(R.id.bookmark_list_recycler_view), 0), 0), withText("Desserts")));

        // Click on “Desserts” folder that was just created
        // Check that folder is empty
        onView(allOf(withId(R.id.linear_folder_layout), childAtPosition(childAtPosition(withId(R.id.bookmark_list_recycler_view), 0), 0), isDisplayed())).perform(click());
        onView(withId(R.id.folder_child_recycler_view)).check(matches(hasChildCount(0)));
    }

    @Test
    public void AddDuplicateFolderTest() {
        // (Assumes that a folder named "Desserts" already exists)
        // Click on “Profile” -> “Bookmarked Recipes” -> “New Folder” button
        // Type “Desserts” in “Enter folder name” text input field -> Click on “Done”
        // Check for correct toast message and that folder is not created
        onView(withId(R.id.profile)).perform(click());
        onView(withId(R.id.bookmarked_list_card)).perform(click());
        onView(withId(R.id.add_folder_dialog_button)).check(matches(withText("New Folder"))).perform(click());
        onView(withId(R.id.dialog_new_folder_name_input)).perform(click());
        onView((withId(R.id.dialog_new_folder_name_input))).perform(replaceText("Desserts"), closeSoftKeyboard());
        onView(withId(R.id.dialog_new_folder_confirm_button)).check(matches(withText("Done"))).perform(click());
        onView(withText(R.string.duplicate_folder_name_toast_msg)).inRoot(new ToastMatcher()).check(matches(isDisplayed()));
        onView(withId(R.id.dialog_new_folder_confirm_button)).check(matches(withText("Done"))).perform(pressBack());
        onView(withId(R.id.bookmark_list_recycler_view)).check(matches(hasChildCount(1)));
    }

    // todo: need field testing, wrote raw
    @Test
    public void InvalidRecipeSearchTest() {
        // Click on “Recipes” -> Type “asdfasdf” in search text input
        // Check for correct toast message
        // Check that no recipes appear

    }

    @Test
    public void AddRecipesToFolderTest() throws InterruptedException {
        // Clicks on card button of recipe “Cake Balls” -> Click on bookmark icon button
        // Click on radio button next to “Desserts” folder -> Clicks on “Confirm”
        // Check for correct toast message
        onView(withId(R.id.recipes)).perform(click());
        onView(withId(androidx.appcompat.R.id.search_src_text)).perform(replaceText("cake balls"), closeSoftKeyboard());
        onView(allOf(withId(androidx.appcompat.R.id.search_src_text), withText("cake balls"), childAtPosition(allOf(withId(androidx.appcompat.R.id.search_plate), childAtPosition(withId(androidx.appcompat.R.id.search_edit_frame), 1)), 0))).perform(pressImeActionButton());
        onView(allOf(withId(R.id.recipe_card), childAtPosition(childAtPosition(withId(R.id.recipe_fragment_recycler_view), 0), 0), isDisplayed())).perform(click());
        onView(withId(R.id.add_to_bookmark_button)).perform(scrollTo(), click());
        onView(allOf(withId(R.id.radio_button_dialog_folder_list), withText("Desserts"), childAtPosition(childAtPosition(withId(R.id.recycler_view_bookmark_folder_list), 0), 0), isDisplayed())).perform(click());
        onView(withId(R.id.add_to_bookmark_confirm_button)).perform(click());
        onView(withText("Added recipe to Desserts")).inRoot(new ToastMatcher()).check(matches(isDisplayed()));

        // Same procedures for "Apple Pie Bars"
        onView(withId(R.id.recipes)).perform(click());
        onView(withId(androidx.appcompat.R.id.search_src_text)).perform(replaceText("APPLE PIE BARS"), closeSoftKeyboard());
        onView(allOf(withId(androidx.appcompat.R.id.search_src_text), withText("APPLE PIE BARS"), childAtPosition(allOf(withId(androidx.appcompat.R.id.search_plate), childAtPosition(withId(androidx.appcompat.R.id.search_edit_frame), 1)), 0))).perform(pressImeActionButton());
        onView(allOf(withId(R.id.recipe_card), childAtPosition(childAtPosition(withId(R.id.recipe_fragment_recycler_view), 0), 0), isDisplayed())).perform(click());
        onView(withId(R.id.add_to_bookmark_button)).perform(scrollTo(), click());
        onView(allOf(withId(R.id.radio_button_dialog_folder_list), withText("Desserts"), childAtPosition(childAtPosition(withId(R.id.recycler_view_bookmark_folder_list), 0), 0), isDisplayed())).perform(click());
        onView(withId(R.id.add_to_bookmark_confirm_button)).perform(click());
        onView(withText("Added recipe to Desserts")).inRoot(new ToastMatcher()).check(matches(isDisplayed()));

        // Click on “Profile” -> “Bookmarked Recipes” -> “Desserts” folder
        // Check that the folder contains the two recipes
        onView(withId(R.id.profile)).perform(click());
        onView(withId(R.id.bookmarked_list_card)).perform(click());
        onView(allOf(withId(R.id.linear_folder_layout), childAtPosition(childAtPosition(withId(R.id.bookmark_list_recycler_view), 0), 0), isDisplayed())).perform(click());
        onView(allOf(withId(R.id.linear_folder_layout), childAtPosition(childAtPosition(withId(R.id.bookmark_list_recycler_view), 0), 0), hasChildCount(2)));
        onView(allOf(withId(R.id.folder_child_recycler_view), childAtPosition(withId(R.id.expandable_folder_layout), 0), withText("Cake Balls")));
        onView(allOf(withId(R.id.folder_child_recycler_view), childAtPosition(withId(R.id.expandable_folder_layout), 1), withText("Apple Pie Bars")));
    }

    // todo: need field testing, wrote raw
    @Test
    public void RemoveRecipeFromFolderTest() {
        // Click on “Profile” -> “Bookmarked Recipes” -> “Desserts” folder -> “Cake Balls” recipe
        // Click on bookmark icon button -> “Remove Bookmark”
        // Check for correct toast message
        onView(withId(R.id.profile)).perform(click());
        onView(withId(R.id.bookmarked_list_card)).perform(click());

        // Click on “Profile” -> “Bookmarked Recipes” -> “Desserts” folder
        // Check that the folder no longer contains the "Cake Balls" recipe

    }

    // todo: need field testing, wrote raw
    @Test
    public void DeleteBookmarkFolderTest() {
        // Click on “Profile” -> “Bookmarked Recipes” -> “Desserts” folder
        // Check that the folder contains the recipe "Apple Pie Bars"

        // Click on garbage can icon button next to folder name “Desserts” -> “Confirm”
        // Check for correct toast message
        // Check that the folder is no longer in the list of folders

        // Click on “Recipes” -> Type “cake balls” in search text input
        // Clicks on card button of recipe “Cake Balls” -> Click on bookmark icon button
        // Check that dialog says "This recipe is not in any folders"
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
