package com.example.recipez;

import org.junit.runner.RunWith;
import org.junit.runners.Suite;

@RunWith(Suite.class)
@Suite.SuiteClasses({LoginActivityTest.class, ManageIngredientsUseCaseTest.class, BookmarkUseCaseTest.class, FilterRecipeUseCaseTest.class})
public class FrontendTestSuite {
}
