import requests
from bs4 import BeautifulSoup
import json

url = 'https://www.pstat.ucsb.edu/news/conferences'

#200

page = requests.get(url)
print(page.status_code)
soup = BeautifulSoup(page.content, 'html.parser')
title = soup.title.text
print(title)
# Conferences | Department of Statistics and Applied Probability - UC Santa Barbara

data={"name": [], "url": [], "date": []}

conferences = soup.find('div', class_='field-item even').contents
for conference in conferences:
    if conference.name == '\n':
        continue
    elif conference.name == 'h3':
        try:
            name = conference.css.select('h3 > a')[0].text.strip()
            url = conference.css.select('h3 > a')[0].attrs['href']
            data["name"].append(name)
            data["url"].append(url)
        except:
            name = conference.contents[0].text.strip()
            data["name"].append(name)
            data["url"].append("No URL")
        continue
    elif conference.name == 'p':
        date = conference.contents[0].text.strip()
        data["date"].append(date)
        continue
    else:
        continue

json_data = json.dumps(data, indent=4)

# 4. Save the JSON data to a file
with open("event_data.json", "w") as f:
    f.write(json_data)


