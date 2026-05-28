import requests
from flask import Blueprint, request, jsonify

store_bp = Blueprint('store', __name__)

@store_bp.route('/api/search-address')
def search_address():

    q = request.args.get('q', '').strip()

    if len(q) < 3:
        return jsonify([])

    try:

        res = requests.get(
            'https://nominatim.openstreetmap.org/search',
            params={
                'q': q,
                'format': 'json',
                'limit': 5
            },
            headers={
                'User-Agent': 'PawStoreApp/1.0'
            },
            timeout=10
        )

        return jsonify(res.json())

    except Exception as e:

        print(e)

        return jsonify([])