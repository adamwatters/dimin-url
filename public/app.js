(function(){
	var app = angular.module("diminURL",[]);

	app.factory("Data", function(){
		return {resultsArray: []}
	})

	app.controller("UrlSubmitter", function($scope, $http, Data) {
		$scope.link = "";
		$scope.submit = function() {
			$http.get("/longURL?link=" + $scope.link).success(function(data){
				console.log("success")
				Data.resultsArray.push({link: $scope.link, shortUrl: data});
			});
		};
	})

	app.controller("ResultsPanel", function($scope, Data) {
		$scope.results = Data.resultsArray;
	});

})();