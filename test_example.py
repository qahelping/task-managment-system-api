import json

import requests


def test_example():
    url = "http://localhost:8000/auth/login"

    payload = json.dumps({
        "email": "user6@example.com",
        "password": "user6123"
    })
    headers = {
        'Content-Type': 'application/json'
    }

    response = requests.request("POST", url, headers=headers, data=payload)
    res_json = response.json()
    print(res_json['access_token'])

    url = "http://localhost:8000/users/?skip=0&limit=100"

    headers = {
        'Authorization': f"Bearer {res_json['access_token']}",
        'Content-Type': 'application/json'
    }

    response = requests.request("GET", url, headers=headers)
    res_json = response.json()
    print(res_json)
    assert res_json[0]['username'] == 'admin'
    assert response.status_code == 200

    print(response.text)
