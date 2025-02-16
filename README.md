# recommend_me_food

All possible categories:
```python
['European restaurant' 'Goan restaurant' 'Pan-Asian restaurant'
 'Mediterranean restaurant' 'North Indian restaurant'
 'Cantonese restaurant' 'Arab restaurant' 'Biryani restaurant'
 'Steak house' 'Barbecue restaurant' 'Buffet restaurant'
 'Fine dining restaurant' 'Italian restaurant' 'Vegetarian restaurant'
 'Seafood restaurant' 'Fast food restaurant' 'Burmese restaurant'
 'South Indian restaurant' 'Brewpub' 'Fusion restaurant'
 'Asian restaurant' 'Eclectic restaurant' 'Andhra restaurant'
 'Non Vegetarian Restaurant' 'Middle Eastern restaurant'
 'Mexican restaurant' 'Indian restaurant' 'Japanese restaurant'
 'Chinese restaurant' 'Continental restaurant' 'Restaurant'
 'Turkish restaurant' 'Modern Indian restaurant' 'Bar & grill' 'Brewery'
 'Bar' 'Thai restaurant' 'Organic restaurant' 'Cocktail bar' 'Lounge'
 'French restaurant']
```

Command to train
```python
python src/main.py train
```

Command to start infer
```shell
uvicorn src.deployment.app:app --host 0.0.0.0 --port 8000
```

Command for sample request
```shell
curl -X POST "http://localhost:8000/recommend" \
     -H "Content-Type: application/json" \
     -d '{
           "query": "loved the sushi",
           "city": "Bangalore",
           "category": "Japanese restaurant"
         }'
```
