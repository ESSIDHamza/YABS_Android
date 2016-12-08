var monApplication = angular.module("mon-application", [ "ngRoute",
		"ngCookies", "angularCharts" ]);

monApplication
		.config(function($routeProvider) {
			$routeProvider
					.when(
							"/accueil",
							{
								templateUrl : "/PresentationYABS/template/carousel.html"
							})
					.when(
							"/inscription",
							{
								resolve : {
									check : function($location, $cookies) {
										if ($cookies
												.getObject("utilisateurYABS") != null)
											$location.path("/");
									}
								},
								templateUrl : "/PresentationYABS/template/inscription.html"
							})
					.when(
							"/modification-infos",
							{
								resolve : {
									check : function($location, $cookies) {
										if ($cookies
												.getObject("utilisateurYABS") == null)
											$location.path("/");
									}
								},
								templateUrl : "/PresentationYABS/template/modification_infos.html"
							})
					.when(
							"/ajout-livre",
							{
								resolve : {
									check : function($location, $cookies) {
										if (($cookies
												.getObject("utilisateurYABS") == null)
												|| ($cookies
														.getObject("utilisateurYABS").admin == "false"))
											$location.path("/");
									}
								},
								templateUrl : "/PresentationYABS/template/ajout_livre.html"
							})
					.when(
							"/liste-livres",
							{
								templateUrl : "/PresentationYABS/template/liste_livres.html"
							})
					.when(
							"/modification-livre",
							{
								resolve : {
									check : function($location, $cookies) {
										if (($cookies
												.getObject("utilisateurYABS") == null)
												|| ($cookies
														.getObject("utilisateurYABS").admin == "false")
												|| ($cookies
														.getObject("idLivreAModifier") == null))
											$location.path("/");
									}
								},
								templateUrl : "/PresentationYABS/template/modification_livre.html"
							})
					.when(
							"/statistiques",
							{
								resolve : {
									check : function($location, $cookies) {
										if (($cookies
												.getObject("utilisateurYABS") == null)
												|| ($cookies
														.getObject("utilisateurYABS").admin == "false"))
											$location.path("/");
									}
								},
								templateUrl : "/PresentationYABS/template/statistiques.html"
							})
					.otherwise(
							{
								templateUrl : "/PresentationYABS/template/carousel.html"
							});
		});

monApplication.config(function($httpProvider) {
	$httpProvider.defaults.useXDomain = true;
});

monApplication
		.controller(
				"authentificationCtrl",
				function($scope, $http, $cookies, $rootScope, $location) {
					$rootScope.utilisateur = $cookies
							.getObject("utilisateurYABS");
					$scope.authentifier = function() {
						$http
								.post(
										"http://localhost:8080/ServiceYABS/api/utilisateurs/authentification",
										{
											login : $scope.login,
											mdp : $scope.mdp
										})
								.success(
										function(reponse) {
											$location.path("/");
											$cookies.putObject("tokenYABS", {
												id : reponse.token.id,
												token : reponse.token.token
											});
											$cookies.putObject(
													"utilisateurYABS",
													reponse.utilisateur);
											$rootScope.utilisateur = reponse.utilisateur;
											$scope.login = "";
											$scope.mdp = "";
											$scope.authentificationForm
													.$setPristine();
											$scope.affichageMessageErreurAuthentification = false;
											$http
													.get(
															"http://localhost:8080/ServiceYABS/api/livres")
													.success(
															function(reponse) {
																if (reponse != null)
																	if ((!Array
																			.isArray(reponse.livre)))
																		$rootScope.livreUnique = reponse.livre;
																	else
																		$rootScope.livreUnique = null;
																else
																	$rootScope.livreUnique = null;
															});
										})
								.error(
										function() {
											$scope.affichageMessageErreurAuthentification = true;
											$scope.login = "";
											$scope.mdp = "";
											$scope.authentificationForm
													.$setPristine();
										});
					};
				});

monApplication
		.controller(
				"deconnexionCtrl",
				function($scope, $http, $cookies, $rootScope, $location) {
					$scope.seDeconnecter = function() {
						$http
								.post(
										"http://localhost:8080/ServiceYABS/api/utilisateurs/deconnexion",
										{
											id : $cookies
													.getObject("tokenYABS").id,
											token : $cookies
													.getObject("tokenYABS").token
										}).success(function() {
									$location.path("/");
									$cookies.remove("tokenYABS");
									$cookies.remove("utilisateurYABS");
									$rootScope.utilisateur = null;
									$cookies.remove("idLivreAModifier");
								});
					};
				});

monApplication
		.controller(
				"inscriptionCtrl",
				function($scope, $http) {
					$scope.inscrire = function() {
						$http
								.post(
										"http://localhost:8080/ServiceYABS/api/utilisateurs",
										{
											nom : $scope.nom,
											prenom : $scope.prenom,
											adresse : $scope.adresse,
											mail : $scope.mail,
											login : $scope.login,
											mdp : $scope.mdp
										})
								.success(
										function() {
											$scope.nom = "";
											$scope.prenom = "";
											$scope.adresse = "";
											$scope.mail = "";
											$scope.login = "";
											$scope.mdp = "";
											$scope.inscriptionForm
													.$setPristine();
											$scope.msgSuccIns = "Succès d'inscription ! Veuillez maintenant vous authentifier !";
										});
					}
				});

monApplication
		.controller(
				"modificationCtrl",
				function($scope, $http, $cookies, $rootScope) {
					$rootScope.utilisateur = $cookies
							.getObject("utilisateurYABS");
					$scope.nom = $rootScope.utilisateur.nom;
					$scope.prenom = $rootScope.utilisateur.prenom;
					$scope.adresse = $rootScope.utilisateur.adresse;
					$scope.mail = $rootScope.utilisateur.mail;
					$scope.login = $rootScope.utilisateur.login;
					$scope.mdp = $rootScope.utilisateur.mdp;
					$scope.modifier = function() {
						$http
								.put(
										"http://localhost:8080/ServiceYABS/api/utilisateurs/"
												+ $rootScope.utilisateur.id,
										{
											utilisateur : {
												nom : $scope.nom,
												prenom : $scope.prenom,
												adresse : $scope.adresse,
												mail : $scope.mail,
												login : $scope.login,
												mdp : $scope.mdp,
												admin : $cookies
														.getObject("utilisateurYABS").admin
											},
											token : $cookies
													.getObject("tokenYABS")
										})
								.success(
										function(reponse) {
											$cookies.putObject(
													"utilisateurYABS", reponse);
											$scope.modificationForm
													.$setPristine();
											$scope.msgSuccModif = "Succès de modification de vos informations !";
										})
								.error(
										function() {
											alert("Vous n'êtes pas autorisé à effectuer cette action !");
										});
					}
				});

monApplication
		.controller(
				"ajoutLivreCtrl",
				function($scope, $http, $rootScope, $cookies) {
					$scope.categorie = "";
					$scope.ajouterLivre = function() {
						$http
								.post(
										"http://localhost:8080/ServiceYABS/api/livres",
										{
											livre : {
												titre : $scope.titre,
												auteur : $scope.auteur,
												nbrCopies : $scope.nbrCopies,
												categorie : $scope.categorie,
												prix : $scope.prix,
												synopsis : $scope.synopsis
											},
											token : $cookies
													.getObject("tokenYABS")
										})
								.success(
										function() {
											$http
													.get(
															"http://localhost:8080/ServiceYABS/api/livres/categories")
													.success(
															function(reponse) {
																$rootScope.categories = reponse.categories;
																$http
																		.get(
																				"http://localhost:8080/ServiceYABS/api/livres")
																		.success(
																				function(
																						reponse) {
																					if (reponse != null)
																						if (!Array
																								.isArray(reponse.livre))
																							$rootScope.livreUnique = reponse.livre;
																						else
																							$rootScope.livreUnique = null;
																					else
																						$rootScope.livreUnique = null;
																					$scope.titre = "";
																					$scope.auteur = "";
																					$scope.categorie = "";
																					$scope.nbrCopies = "";
																					$scope.prix = "";
																					$scope.synopsis = "";
																					$scope.ajoutLivreForm
																							.$setPristine();
																					$http
																							.get(
																									"http://localhost:8080/ServiceYABS/api/livres")
																							.success(
																									function(
																											reponse) {
																										$scope.uploadImage = true;
																										var ids = [];
																										for (var i = 0; i < reponse.livre.length; i++)
																											ids
																													.push(parseInt(reponse.livre[i].id));
																										max = Math.max
																												.apply(
																														null,
																														ids);
																										$scope.requettePost = "http://localhost:8080/ServiceYABS/api/livres/"
																												+ max
																												+ "/image";
																									});
																				});
															});
										});
					};
				});

monApplication.controller("listerLivresCtrl", function($scope, $http,
		$rootScope) {
	$http.get("http://localhost:8080/ServiceYABS/api/livres").success(
			function(reponse) {
				var tableauxLivres = [];
				for (var i = 0; i < reponse.livre.length - reponse.livre.length
						% 3; i += 3) {
					var tableauLivres = [];
					for (var j = 0; j < 3; j++)
						tableauLivres.push(reponse.livre[i + j]);
					tableauxLivres.push(tableauLivres);
				}
				var tableauLivres = [];
				for (var i = 0; i < reponse.livre.length % 3; i++)
					tableauLivres.push(reponse.livre[reponse.livre.length
							- reponse.livre.length % 3 + i]);
				tableauxLivres.push(tableauLivres);
				$rootScope.tableauxLivres = tableauxLivres;
				if (reponse != null)
					if (!Array.isArray(reponse.livre))
						$rootScope.livreUnique = reponse.livre;
					else
						$rootScope.livreUnique = null;
				else
					$rootScope.livreUnique = null;
				$rootScope.listingCategorie = false;
			});
});

monApplication
		.controller(
				"categoriesCtrl",
				function($scope, $http, $rootScope) {
					$http
							.get(
									"http://localhost:8080/ServiceYABS/api/livres/categories")
							.success(
									function(reponse) {
										$rootScope.categories = reponse.categories;
										$scope.setCategorie = function(
												categorie) {
											$http
													.get(
															"http://localhost:8080/ServiceYABS/api/livres/categorie/"
																	+ categorie)
													.success(

															function(reponse) {
																var tableauxLivres = [];
																for (var i = 0; i < reponse.livre.length
																		- reponse.livre.length
																		% 3; i += 3) {
																	var tableauLivres = [];
																	for (var j = 0; j < 3; j++)
																		tableauLivres
																				.push(reponse.livre[i
																						+ j]);
																	tableauxLivres
																			.push(tableauLivres);
																}
																var tableauLivres = [];
																for (var i = 0; i < reponse.livre.length % 3; i++)
																	tableauLivres
																			.push(reponse.livre[reponse.livre.length
																					- reponse.livre.length
																					% 3
																					+ i]);
																tableauxLivres
																		.push(tableauLivres);
																$rootScope.tableauxLivres = tableauxLivres;
																if (reponse != null)
																	if (!Array
																			.isArray(reponse.livre))
																		$rootScope.livreUnique = reponse.livre;
																	else
																		$rootScope.livreUnique = null;
																else
																	$rootScope.livreUnique = null;
																$rootScope.listingCategorie = true;
																$rootScope.categorie = categorie;
															});
										};
									});
				});

monApplication
		.controller(
				"panierCtrl",
				function($scope, $http, $cookies, $rootScope) {
					$scope.estAjoute = function(idLivre) {
						var panier = null;
						if ($cookies.getObject("utilisateurYABS") != null)
							panier = $cookies.getObject("utilisateurYABS").panier;
						if (panier == null)
							return false;
						for (var i = 0; i < panier.length; i++)
							if (panier[i].id == idLivre)
								return true;
						if (panier.id == idLivre)
							return true;
						return false;
					};
					$scope.ajouter = function(idLivre) {
						$http
								.put(
										"http://localhost:8080/ServiceYABS/api/utilisateurs/"
												+ $cookies
														.getObject("utilisateurYABS").id
												+ "/panier/ajout/livre/"
												+ idLivre,
										{
											id : $cookies
													.getObject("tokenYABS").id,
											token : $cookies
													.getObject("tokenYABS").token
										})
								.success(
										function(reponse) {
											$cookies.putObject(
													"utilisateurYABS", reponse);
											$rootScope.utilisateur = reponse;
											$http
													.get(
															"http://localhost:8080/ServiceYABS/api/livres")
													.success(
															function(reponse) {
																var tableauxLivres = [];
																for (var i = 0; i < reponse.livre.length
																		- reponse.livre.length
																		% 3; i += 3) {
																	var tableauLivres = [];
																	for (var j = 0; j < 3; j++)
																		tableauLivres
																				.push(reponse.livre[i
																						+ j]);
																	tableauxLivres
																			.push(tableauLivres);
																}
																var tableauLivres = [];
																for (var i = 0; i < reponse.livre.length % 3; i++)
																	tableauLivres
																			.push(reponse.livre[reponse.livre.length
																					- reponse.livre.length
																					% 3
																					+ i]);
																tableauxLivres
																		.push(tableauLivres);
																$rootScope.tableauxLivres = tableauxLivres;
																if (reponse != null)
																	if (!Array
																			.isArray(reponse.livre))
																		$rootScope.livreUnique = reponse.livre;
																	else
																		$rootScope.livreUnique = null;
																else
																	$rootScope.livreUnique = null;
																$rootScope.listingCategorie = false;
															});
										})
								.error(
										function() {
											alert("Vous n'êtes pas autorisé à effectuer cette action !");
										});
					};
					$scope.retirer = function(idLivre) {
						$http
								.put(
										"http://localhost:8080/ServiceYABS/api/utilisateurs/"
												+ $cookies
														.getObject("utilisateurYABS").id
												+ "/panier/retrait/livre/"
												+ idLivre,
										{
											id : $cookies
													.getObject("tokenYABS").id,
											token : $cookies
													.getObject("tokenYABS").token
										})
								.success(
										function(reponse) {
											$cookies.putObject(
													"utilisateurYABS", reponse);
											$rootScope.utilisateur = reponse;
											$http
													.get(
															"http://localhost:8080/ServiceYABS/api/livres")
													.success(
															function(reponse) {
																var tableauxLivres = [];
																for (var i = 0; i < reponse.livre.length
																		- reponse.livre.length
																		% 3; i += 3) {
																	var tableauLivres = [];
																	for (var j = 0; j < 3; j++)
																		tableauLivres
																				.push(reponse.livre[i
																						+ j]);
																	tableauxLivres
																			.push(tableauLivres);
																}
																var tableauLivres = [];
																for (var i = 0; i < reponse.livre.length % 3; i++)
																	tableauLivres
																			.push(reponse.livre[reponse.livre.length
																					- reponse.livre.length
																					% 3
																					+ i]);
																tableauxLivres
																		.push(tableauLivres);
																$rootScope.tableauxLivres = tableauxLivres;
																if (reponse != null)
																	if (!Array
																			.isArray(reponse.livre))
																		$rootScope.livreUnique = reponse.livre;
																	else
																		$rootScope.livreUnique = null;
																else
																	$rootScope.livreUnique = null;
																$rootScope.listingCategorie = false;
															});
										})
								.error(
										function() {
											alert("Vous n'êtes pas autorisé à effectuer cette action !");
										});
					}
				});

monApplication.controller("livreSelectionneCtrl", function($scope, $cookies) {
	$scope.getId = function(id) {
		$cookies.putObject("idLivreAModifier", id);
	};
});

monApplication
		.controller(
				"modificationLivreCtrl",
				function($scope, $http, $cookies) {
					if ($cookies.getObject("idLivreAModifier") != null)
						$http
								.get(
										"http://localhost:8080/ServiceYABS/api/livres/"
												+ $cookies
														.getObject("idLivreAModifier"))
								.success(
										function(reponse) {
											$scope.titre = reponse.titre;
											$scope.auteur = reponse.auteur;
													$scope.nbrCopies = parseInt(reponse.nbrCopies),
													$scope.categorie = reponse.categorie;
											$scope.prix = parseFloat(reponse.prix);
											$scope.synopsis = reponse.synopsis;
										});
					$scope.modifierLivre = function() {
						$http
								.put(
										"http://localhost:8080/ServiceYABS/api/livres/"
												+ $cookies
														.getObject("idLivreAModifier"),
										{
											livre : {
												titre : $scope.titre,
												auteur : $scope.auteur,
												nbrCopies : $scope.nbrCopies,
												categorie : $scope.categorie,
												prix : $scope.prix,
												synopsis : $scope.synopsis
											},
											token : $cookies
													.getObject("tokenYABS")
										})
								.success(
										function(reponse) {
											$scope.titre = reponse.titre;
											$scope.auteur = reponse.auteur;
											$scope.nbrCopies = parseInt(reponse.nbrCopies);
											$scope.categorie = reponse.categorie;
											$scope.prix = parseFloat(reponse.prix);
											$scope.synopsis = reponse.synopsis;
											$scope.msgSuccModif = "Succès de modification des informations du livre !";
										});
						$scope.modificationLivreForm.$setPristine();
					}
				});

monApplication
		.controller(
				"suppressionLivreCtrl",
				function($scope, $http, $cookies, $rootScope) {
					$scope.supprimerLivre = function(idLivre) {
						$http
								.get(
										"http://localhost:8080/ServiceYABS/api/livres/"
												+ idLivre + "/supprimable")
								.success(
										function(reponse) {
											if (reponse.estSupprimable == "true")
												$http
														.delete(
																"http://localhost:8080/ServiceYABS/api/livres/"
																		+ idLivre)
														.success(
																function() {
																	if (!$rootScope.listingCategorie)
																		$http
																				.get(
																						"http://localhost:8080/ServiceYABS/api/livres")
																				.success(
																						function(
																								reponse) {
																							var tableauxLivres = [];
																							for (var i = 0; i < reponse.livre.length
																									- reponse.livre.length
																									% 3; i += 3) {
																								var tableauLivres = [];
																								for (var j = 0; j < 3; j++)
																									tableauLivres
																											.push(reponse.livre[i
																													+ j]);
																								tableauxLivres
																										.push(tableauLivres);
																							}
																							var tableauLivres = [];
																							for (var i = 0; i < reponse.livre.length % 3; i++)
																								tableauLivres
																										.push(reponse.livre[reponse.livre.length
																												- reponse.livre.length
																												% 3
																												+ i]);
																							tableauxLivres
																									.push(tableauLivres);
																							$rootScope.tableauxLivres = tableauxLivres;
																							if (reponse != null)
																								if (!Array
																										.isArray(reponse.livre))
																									$rootScope.livreUnique = reponse.livre;
																								else
																									$rootScope.livreUnique = null;
																							else
																								$rootScope.livreUnique = null;
																						});
																	else
																		$http
																				.get(
																						"http://localhost:8080/ServiceYABS/api/livres/categorie/"
																								+ $rootScope.categorie)
																				.success(
																						function(
																								reponse) {
																							if (reponse != null) {
																								var tableauxLivres = [];
																								for (var i = 0; i < reponse.livre.length
																										- reponse.livre.length
																										% 3; i += 3) {
																									var tableauLivres = [];
																									for (var j = 0; j < 3; j++)
																										tableauLivres
																												.push(reponse.livre[i
																														+ j]);
																									tableauxLivres
																											.push(tableauLivres);
																								}
																								var tableauLivres = [];
																								for (var i = 0; i < reponse.livre.length % 3; i++)
																									tableauLivres
																											.push(reponse.livre[reponse.livre.length
																													- reponse.livre.length
																													% 3
																													+ i]);
																								tableauxLivres
																										.push(tableauLivres);
																								$rootScope.tableauxLivres = tableauxLivres;
																								if (!Array
																										.isArray(reponse.livre))
																									$rootScope.livreUnique = reponse.livre;
																								else
																									$rootScope.livreUnique = null;
																							} else
																								$rootScope.livreUnique = null;
																						});
																	$http
																			.get(
																					"http://localhost:8080/ServiceYABS/api/livres/categories")
																			.success(
																					function(
																							reponse) {
																						$rootScope.categories = reponse.categories;
																					});
																	if ($cookies
																			.getObject("idLivreAModifier") == idLivre)
																		$cookies
																				.remove("idLivreAModifier");
																});
											else
												alert("Ce livre existe déjà dans le panier d'un client !");
										});
					}
				});

monApplication
		.controller(
				"payerCtrl",
				function($scope, $cookies, $rootScope, $http, $window) {
					$scope.payer = function() {
						$http
								.get(
										"http://localhost:8080/ServiceYABS/api/utilisateurs/"
												+ $cookies
														.getObject("utilisateurYABS").id
												+ "/facture",
										{
											params : {
												token : $cookies
														.getObject("tokenYABS").token
											}
										})
								.success(
										function(reponse) {
											var nom = reponse.nom;
											var prenom = reponse.prenom;
											var adresse = reponse.adresse;
											var mail = reponse.mail;
											var total = reponse.total;
											$http
													.get(
															"http://localhost:8080/ServiceYABS/api/facture",
															{
																params : {
																	nom : reponse.nom,
																	prenom : reponse.prenom,
																	adresse : reponse.adresse,
																	mail : reponse.mail,
																	total : reponse.total,
																	id : $cookies
																			.getObject("utilisateurYABS").id
																}
															})
													.success(
															function(reponse) {
																setTimeout(
																		function() {
																			$window.location.href = "http://localhost:8080/ServiceYABS/factures/"
																					+ reponse;
																		},
																		10000);
															});
										})
								.error(
										function() {
											alert("Vous n'êtes pas autorisé à effectuer cette action !");
										});
					};
				});

monApplication
		.controller(
				"nombreUtilisateursConnectesCtrl",
				function($scope, $http) {
					setInterval(
							function() {
								$http
										.get(
												"http://localhost:8080/ServiceYABS/api/utilisateurs/nombreUtilisateursConnectes")
										.success(
												function(reponse) {
													$scope.nombreUtilisateursConnectes = reponse.nombreUtilisateursConnectes;
												});
							}, 1000);
				});

monApplication
		.controller(
				"statistiquesCtrl",
				function($scope, $http) {
					setInterval(
							function() {
								$http
										.get(
												"http://localhost:8080/ServiceYABS/api/livres/categories/statistiques")
										.success(
												function(reponse) {
													var data = [];
													for (var i = 0; i < reponse.categorieStat.length; i++)
														data
																.push({
																	x : reponse.categorieStat[i].categorie,
																	y : reponse.categorieStat[i].n
																});
													$scope.config = {
														title : "Statistiques des Catégories des livres vendus",
														tooltips : true,
														labels : false,
														legend : {
															display : true,
															position : "left"
														},
														innerRadius : 50
													}
													$scope.data = {
														"series" : [ "Catégories" ],
														data : data
													};
												});
							}, 1000);
				});