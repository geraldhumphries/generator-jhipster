'use strict';

angular.module('<%=angularAppName%>')
    .controller('<%= entityClass %>Controller', function ($scope, $state<% if (fieldsContainBlob) { %>, DataUtils<% } %>, <%= entityClass %><% if (searchEngine == 'elasticsearch') { %>, <%= entityClass %>Search<% } %><% if (pagination != 'no') { %>, ParseLinks<% } %>) {

        $scope.<%= entityInstance %>s = [];
        <%_ if (pagination != 'no') { _%>
        $scope.predicate = 'id';
        $scope.reverse = true;
        <%_ } _%>
        <%_ if (pagination == 'pager' || pagination == 'pagination') { _%>
        $scope.page = 1;
        $scope.loadAll = function() {
            if ($scope.currentSearch) {
                <%= entityClass %>Search.query({
                    query: $scope.searchQuery,
                    page: $scope.page - 1,
                    size: 20,
                    sort: [$scope.predicate + ',' + ($scope.reverse ? 'asc' : 'desc'), 'id']
                }, function (result, headers) {
                    $scope.links = ParseLinks.parse(headers('link'));
                    $scope.totalItems = headers('X-Total-Count');
                    $scope.<%= entityInstance %>s = result;
                });
            } else {
                <%= entityClass %>.query({
                    page: $scope.page - 1,
                    size: 20,
                    sort: [$scope.predicate + ',' + ($scope.reverse ? 'asc' : 'desc'), 'id']
                }, function(result, headers) {
                    $scope.links = ParseLinks.parse(headers('link'));
                    $scope.totalItems = headers('X-Total-Count');
                    $scope.<%= entityInstance %>s = result;
                });
            }
        };
        <%_ } _%>
        <%_ if (pagination == 'infinite-scroll') { _%>
        $scope.page = 0;
        $scope.loadAll = function() {
            <%= entityClass %>.query({page: $scope.page, size: 20, sort: [$scope.predicate + ',' + ($scope.reverse ? 'asc' : 'desc'), 'id']}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                for (var i = 0; i < result.length; i++) {
                    $scope.<%= entityInstance %>s.push(result[i]);
                }
            });
        };
        $scope.reset = function() {
            $scope.page = 0;
            $scope.<%= entityInstance %>s = [];
            $scope.loadAll();
        };
        <%_ } _%>
        <%_ if (pagination != 'no') { _%>
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        <%_ } _%>
        <%_ if (pagination == 'no') { _%>
        $scope.loadAll = function() {
            <%= entityClass %>.query(function(result) {
               $scope.<%= entityInstance %>s = result;
            });
        };
        <%_ } _%>
        <%_ if (searchEngine == 'elasticsearch') { _%>

        $scope.search = function (searchQuery) {
            $scope.links = null;
            $scope.page = 1;
            $scope.predicate = 'id';
            $scope.reverse = true;
            $scope.currentSearch = searchQuery;
            $scope.loadAll();
        };
        <%_ } _%>

        $scope.clear = function () {
            $scope.links = null;
            $scope.page = 1;
            $scope.predicate = 'id';
            $scope.reverse = true;
            $scope.currentSearch = null;
            $scope.loadAll();
        };
        <%_ if (fieldsContainBlob) { _%>

        $scope.abbreviate = DataUtils.abbreviate;

        $scope.byteSize = DataUtils.byteSize;
        <%_ } _%>

        $scope.loadAll();
    });
