

public class Recipe {
    private int id;
    private String name;
    private String image;
    private List<String> tags;

    public Recipe(String name, String image, List<String> tags) {
        this.name = name;
        this.image = image;
        this.tags = tags;
    }
}
