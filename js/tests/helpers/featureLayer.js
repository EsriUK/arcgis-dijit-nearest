var featureLayer = {
    "currentVersion": 10.3,
    "id": 1,
    "name": "ReleatedData",
    "type": "Table",
    "displayField": "RelatedID",
    "description": "",
    "copyrightText": "",
    "defaultVisibility": false,
    "editingInfo": {
        "lastEditDate": 1438096896711
    },
    "relationships": [
        {
            "id": 0,
            "name": "points",
            "relatedTableId": 0,
            "cardinality": "esriRelCardinalityOneToMany",
            "role": "esriRelRoleDestination",
            "keyField": "RelatedID",
            "composite": false
        }
    ],
    "isDataVersioned": false,
    "supportsCalculate": true,
    "supportsAttachmentsByUploadId": true,
    "supportsRollbackOnFailureParameter": true,
    "supportsStatistics": true,
    "supportsAdvancedQueries": true,
    "supportsValidateSql": true,
    "supportsCoordinatesQuantization": true,
    "advancedQueryCapabilities": {
        "supportsPagination": true,
        "supportsQueryWithDistance": true,
        "supportsReturningQueryExtent": true,
        "supportsStatistics": true,
        "supportsOrderBy": true,
        "supportsDistinct": true
    },
    "allowGeometryUpdates": true,
    "hasAttachments": false,
    "htmlPopupType": "esriServerHTMLPopupTypeNone",
    "hasM": false,
    "hasZ": false,
    "objectIdField": "OBJECTID",
    "globalIdField": "",
    "typeIdField": "",
    "fields": [
        {
            "name": "OBJECTID",
            "type": "esriFieldTypeOID",
            "alias": "OBJECTID",
            "sqlType": "sqlTypeOther",
            "nullable": false,
            "editable": false,
            "domain": null,
            "defaultValue": null
        },
        {
            "name": "RelatedID",
            "type": "esriFieldTypeString",
            "alias": "RelatedID",
            "sqlType": "sqlTypeOther",
            "length": 50,
            "nullable": true,
            "editable": true,
            "domain": null,
            "defaultValue": null
        },
        {
            "name": "RelatedDescription",
            "type": "esriFieldTypeString",
            "alias": "RelatedDescription",
            "sqlType": "sqlTypeOther",
            "length": 50,
            "nullable": true,
            "editable": true,
            "domain": null,
            "defaultValue": null
        }
    ],
    "indexes": [
        {
            "name": "PK__MyRelate__F4B70D8582296CE3",
            "fields": "OBJECTID",
            "isAscending": true,
            "isUnique": true,
            "description": "clustered, unique, primary key"
        },
        {
            "name": "G4RelatedID",
            "fields": "RelatedID",
            "isAscending": true,
            "isUnique": false,
            "description": ""
        }
    ],
    "types": [],
    "templates": [
        {
            "name": "ReleatedData",
            "description": "",
            "drawingTool": "esriFeatureEditToolNone",
            "prototype": {
                "attributes": {
                    "RelatedID": null,
                    "RelatedDescription": null
                }
            }
        }
    ],
    "supportedQueryFormats": "JSON",
    "hasStaticData": false,
    "maxRecordCount": 1000,
    "capabilities": "Create,Delete,Query,Update,Editing"
}