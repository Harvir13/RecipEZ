package com.example.recipez;

import org.json.JSONObject;

import java.util.List;

public class BookmarkFolder {
    private List<JSONObject> recipesInFolder;
    private String folderName;
    private boolean isExpandable;

    public BookmarkFolder(List<JSONObject> recipesList, String folderName) {
        this.recipesInFolder = recipesList;
        this.folderName = folderName;
        this.isExpandable = false;
    }

    public void setExpandable(boolean expandable) {
        isExpandable = expandable;
    }

    public List<JSONObject> getRecipesInFolder() {
        return recipesInFolder;
    }

    public String getFolderName() {
        return folderName;
    }

    public boolean isExpandable() {
        return isExpandable;
    }

}
