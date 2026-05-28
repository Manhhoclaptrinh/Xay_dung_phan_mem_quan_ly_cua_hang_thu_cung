from flask import Blueprint, request, jsonify
import requests

map_bp = Blueprint('map', __name__)

@map_bp.route('/api/search-address')
def search_address():

    q = request.args.get('q', '').strip()

    if len(q) < 3:
        return jsonify([])

    try:

        url = 'https://nominatim.openstreetmap.org/search'

        params = {
            'q': q,
            'format': 'json',
            'limit': 5,
            'addressdetails': 1
        }

        headers = {
            'User-Agent': 'PetStoreApp/1.0'
        }

        response = requests.get(
            url,
            params=params,
            headers=headers,
            timeout=10
        )

        data = response.json()

        result = []

        for item in data:

            result.append({
                'display_name': item.get('display_name'),
                'lat': item.get('lat'),
                'lon': item.get('lon')
            })

        return jsonify(result)

    except Exception as e:

        print(e)

        return jsonify([])